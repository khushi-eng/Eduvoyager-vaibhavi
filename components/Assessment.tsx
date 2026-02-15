import React, { useState, useEffect } from 'react';
import { generateAssessmentQuestions, generateRoadmap } from '../services/gemini';
import { User, Roadmap, AssessmentQuestion } from '../types';
import { Loader2, ArrowRight, ChevronLeft, Check, Target, Briefcase, GraduationCap, Compass, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from './Skeleton';

interface AssessmentProps {
  user: User;
  onComplete: (roadmap: Roadmap) => void;
}

type AssessmentStep = 'intro' | 'designation' | 'domain' | 'generating_questions' | 'questions' | 'analyzing';

export const Assessment: React.FC<AssessmentProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState<AssessmentStep>('intro');
  
  // Manual Inputs
  const [manualDesignation, setManualDesignation] = useState('');
  const [manualDomain, setManualDomain] = useState('');
  const [customDesignation, setCustomDesignation] = useState('');

  // AI Questions State
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<{[key: number]: string[]}>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Analysis simulation state
  const [analysisMsgIndex, setAnalysisMsgIndex] = useState(0);
  const analysisMessages = [
    `Analyzing requirements for ${manualDomain}...`,
    "Evaluating your current skill proficiency...",
    "Mapping profile to NSQF Level standards...",
    "Constructing your personalized roadmap..."
  ];

  // Handler for Phase 1: Designation Selection
  const handleDesignationSelect = (value: string) => {
    setManualDesignation(value);
    setStep('domain');
  };

  // Handler for Phase 2: Domain Submission
  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDomain.trim()) return;
    
    setStep('generating_questions');
    try {
      // Fetch tailored questions based on user input
      const qs = await generateAssessmentQuestions(
        manualDesignation === 'Other' ? customDesignation : manualDesignation, 
        manualDomain, 
        user.age
      );
      setQuestions(qs);
      setStep('questions');
    } catch (e) {
      console.error(e);
      // Fallback questions if API fails
      setQuestions([
          { question: "How would you rate your current knowledge?", options: ["Absolute Beginner", "Some Knowledge", "Intermediate", "Advanced"] },
          { question: "What is your main motivation?", options: ["Career Change", "Hobby", "Academic Requirement", "Upskilling"] },
          { question: "How much time can you commit daily?", options: ["30 mins", "1 hour", "2-3 hours", "4+ hours"] }
      ]);
      setStep('questions');
    }
  };

  // Handler for Analysis Animation
  useEffect(() => {
    if (step === 'analyzing') {
      const interval = setInterval(() => {
        setAnalysisMsgIndex(prev => {
          if (prev < analysisMessages.length - 1) return prev + 1;
          return prev;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Handler for Phase 3: Answering Questions
  const handleOptionSelect = (option: string) => {
    const currentQ = questions[currentQuestionIndex];
    const currentAns = answers[currentQuestionIndex] || [];
    const isMulti = currentQ.allowMultiple;

    if (isMulti) {
        // Toggle logic for multi-select
        const newAns = currentAns.includes(option)
            ? currentAns.filter(a => a !== option)
            : [...currentAns, option];
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: newAns }));
    } else {
        // Single select logic
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: [option] }));
        // Auto advance for single select logic ONLY, after delay
        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 350);
        }
    }
  };

  const handleNextQuestion = async () => {
    // For multi-select, user MUST click Next, so we check if there's at least one answer
    if (questions[currentQuestionIndex].allowMultiple && (!answers[currentQuestionIndex] || answers[currentQuestionIndex].length === 0)) {
        return; 
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStep('analyzing');
      
      const formattedAnswers = questions.map((q, i) => ({
        question: q.question,
        answer: (answers[i] || []).join(", ") || "Skipped"
      }));

      // Pass the manual inputs to roadmap generation
      const finalDesignation = manualDesignation === 'Other' ? customDesignation : manualDesignation;
      const userProfile = { ...user, designation: finalDesignation, domain: manualDomain };
      
      const minAnimationTime = new Promise(resolve => setTimeout(resolve, 4000));
      const generationPromise = generateRoadmap(userProfile, formattedAnswers);
      
      const [_, roadmap] = await Promise.all([minAnimationTime, generationPromise]);
      onComplete(roadmap);
    }
  };

  return (
    <AnimatePresence mode="wait">
        {step === 'intro' && (
            <motion.div 
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto py-12 px-6"
            >
                <div className="bg-[#1e293b]/80 border border-slate-700 rounded-3xl p-8 md:p-12 shadow-2xl text-center backdrop-blur-sm">
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    >
                        <Compass size={32} />
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-4 text-white">Let's Personalize Your Journey</h2>
                    <p className="text-slate-400 mb-8 text-lg">
                        We'll start by understanding who you are and what you want to achieve.
                    </p>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStep('designation')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-xl flex items-center justify-center mx-auto group shadow-lg shadow-blue-500/25"
                    >
                        Start Assessment <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </div>
            </motion.div>
        )}

        {step === 'designation' && (
            <motion.div 
                key="designation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto py-12 px-6"
            >
                <h2 className="text-3xl font-bold mb-2 text-center">Who are you?</h2>
                <p className="text-slate-400 text-center mb-8">Select the option that describes you best.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                    { id: 'Student (School)', label: 'Student (School)', icon: GraduationCap, desc: 'Class 1-12' },
                    { id: 'Student (College)', label: 'Student (College)', icon: GraduationCap, desc: 'Undergrad / Grad' },
                    { id: 'Working Professional', label: 'Working Professional', icon: Briefcase, desc: 'Employee / Freelancer' },
                    { id: 'Job Seeker', label: 'Job Seeker', icon: Target, desc: 'Looking for opportunities' },
                ].map((opt, idx) => (
                    <motion.button
                        key={opt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(51, 65, 85, 0.8)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDesignationSelect(opt.id)}
                        className="flex items-center p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-left group"
                    >
                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors duration-300">
                        <opt.icon size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-lg text-slate-200 group-hover:text-white transition-colors">{opt.label}</div>
                        <div className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">{opt.desc}</div>
                    </div>
                    </motion.button>
                ))}
                </div>

                <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors duration-300">
                <label className="block text-sm font-medium text-slate-400 mb-3">Or type your own:</label>
                <div className="flex gap-3">
                    <input 
                    type="text" 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-all focus:bg-slate-900/80"
                    placeholder="e.g. Entrepreneur, Retired..."
                    value={customDesignation}
                    onChange={(e) => setCustomDesignation(e.target.value)}
                    />
                    <motion.button 
                    whileTap={{ scale: 0.95 }}
                    disabled={!customDesignation.trim()}
                    onClick={() => handleDesignationSelect('Other')}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 rounded-lg font-medium transition-colors"
                    >
                    Next
                    </motion.button>
                </div>
                </div>
            </motion.div>
        )}

        {step === 'domain' && (
            <motion.div 
                key="domain"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto py-12 px-6"
            >
                <button onClick={() => setStep('designation')} className="text-slate-500 hover:text-slate-300 mb-6 flex items-center transition-colors">
                    <ChevronLeft size={16} className="mr-1"/> Back
                </button>

                <h2 className="text-3xl font-bold mb-2 text-center">What is your Goal?</h2>
                <p className="text-slate-400 text-center mb-8">Tell us the domain or skill you want to master.</p>

                <form onSubmit={handleDomainSubmit} className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-xl">
                    <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">Target Domain / Goal</label>
                    <input 
                        autoFocus
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white mb-6 placeholder-slate-600 transition-all focus:bg-slate-900/80"
                        placeholder="e.g. Data Science, Graphic Design, Learn Guitar..."
                        value={manualDomain}
                        onChange={(e) => setManualDomain(e.target.value)}
                    />
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                        {['Python Programming', 'Digital Marketing', 'Civil Engineering', 'Financial Planning'].map(suggestion => (
                            <motion.button 
                                type="button"
                                key={suggestion}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setManualDomain(suggestion)}
                                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-full transition-all border border-slate-600 hover:border-slate-500"
                            >
                                {suggestion}
                            </motion.button>
                        ))}
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={!manualDomain.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center"
                    >
                        Continue <ArrowRight size={20} className="ml-2" />
                    </motion.button>
                </form>
            </motion.div>
        )}

        {step === 'generating_questions' && (
            <motion.div 
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 max-w-2xl mx-auto"
            >
                <div className="w-full space-y-6">
                    <div className="flex justify-center mb-6">
                         <Loader2 size={48} className="text-blue-400 animate-spin" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                </div>
            </motion.div>
        )}

        {step === 'questions' && (
            <motion.div 
                key="questions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto py-8 md:py-12"
            >
                <div className="mb-10 max-w-2xl mx-auto">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-200">Skill Evaluation: <span className="text-blue-400">{manualDomain}</span></h2>
                            <p className="text-slate-500 text-sm">Question {currentQuestionIndex + 1} of {questions.length} {questions[currentQuestionIndex].allowMultiple && <span className="text-blue-400 font-bold ml-1">(Select Multiple)</span>}</p>
                        </div>
                        <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded transition-all">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                    </div>
                </div>

                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-12 shadow-xl">
                    <div className="min-h-[120px] flex flex-col justify-center mb-8">
                        <motion.h3 
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-3xl font-medium leading-relaxed text-center text-white"
                        >
                            {questions[currentQuestionIndex].question}
                        </motion.h3>
                        {questions[currentQuestionIndex].allowMultiple && <p className="text-center text-sm text-slate-400 mt-2">Pick all that apply</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                        {questions[currentQuestionIndex].options.map((option, idx) => {
                            const isSelected = (answers[currentQuestionIndex] || []).includes(option);
                            return (
                                <motion.button
                                    key={`${currentQuestionIndex}-${idx}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handleOptionSelect(option)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`group relative p-6 text-left rounded-2xl border transition-all duration-300 ${isSelected ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/20' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-500'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-lg font-medium transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{option}</span>
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-white bg-white text-blue-600 scale-110' : 'border-slate-600 group-hover:border-slate-400'}`}>
                                            {isSelected && (questions[currentQuestionIndex].allowMultiple ? <CheckSquare size={14} strokeWidth={3} /> : <Check size={14} strokeWidth={4} />)}
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-800 max-w-3xl mx-auto">
                        <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className={`flex items-center px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors ${currentQuestionIndex === 0 ? 'opacity-0 cursor-default' : 'hover:bg-slate-800'}`}>
                            <ChevronLeft size={20} className="mr-2" /> Back
                        </button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNextQuestion} 
                            disabled={(answers[currentQuestionIndex] || []).length === 0} 
                            className={`flex items-center px-8 py-3 rounded-xl font-bold transition-all duration-300 ${ (answers[currentQuestionIndex] || []).length > 0 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                        >
                            {currentQuestionIndex === questions.length - 1 ? 'Generate Roadmap' : 'Next'} <ArrowRight size={20} className="ml-2" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        )}

        {step === 'analyzing' && (
            <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-8"
            >
                <div className="relative mb-12">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="relative z-10 w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-2 border-blue-500/30"
                >
                        <Loader2 size={40} className="text-blue-400 animate-spin" />
                </motion.div>
                </div>
                <div className="space-y-4 max-w-md">
                    {analysisMessages.map((msg, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ 
                                opacity: idx <= analysisMsgIndex ? (idx === analysisMsgIndex ? 1 : 0.4) : 0,
                                x: idx <= analysisMsgIndex ? 0 : -10,
                                scale: idx === analysisMsgIndex ? 1.05 : 1
                            }}
                            className={`flex items-center space-x-3 transition-all duration-500 ${idx === analysisMsgIndex ? 'text-white font-medium' : 'text-slate-500'}`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${idx < analysisMsgIndex ? 'bg-green-500/20 text-green-500' : idx === analysisMsgIndex ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800'}`}>
                                {idx < analysisMsgIndex ? <Check size={14} /> : <div className="w-2 h-2 bg-current rounded-full" />}
                            </div>
                            <span className="text-lg">{msg}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};