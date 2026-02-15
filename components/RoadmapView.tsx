import React, { useState } from 'react';
import { Roadmap, RoadmapStep, Resource, SoftSkill } from '../types';
import { CheckCircle2, Circle, Clock, ExternalLink, Award, DollarSign, BookOpen, Compass, Target, HelpCircle, ArrowRight, Sparkles, Users, ArrowLeft, Layers, MessageCircle, Briefcase, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapViewProps {
  roadmap: Roadmap;
  roadmapHistory?: Roadmap[]; // New prop to access previous levels
  onToggleStep: (stepId: string) => void;
  onNextLevel?: (focusArea: string) => void;
  onPreviousLevel?: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmap, roadmapHistory = [], onToggleStep, onNextLevel, onPreviousLevel }) => {
  const [nextFocus, setNextFocus] = useState('');
  const [activeTab, setActiveTab] = useState<'technical' | 'soft_skills' | 'resources'>('technical');
  const completedStepsCount = roadmap.steps.filter(s => s.completed).length;
  const isAllCompleted = completedStepsCount === roadmap.steps.length;

  // Backward compatibility check for softSkills data
  const normalizedSoftSkills: SoftSkill[] = React.useMemo(() => {
    if (!roadmap.softSkills) return [];
    // If it's the old string array format
    if (typeof roadmap.softSkills[0] === 'string') {
        return (roadmap.softSkills as unknown as string[]).map(skill => ({
            name: skill,
            description: "Essential professional skill.",
            resources: [
                { title: `Learn ${skill}`, url: `https://www.google.com/search?q=learn+${skill}`, type: 'article', isPaid: false, priority: 'high' }
            ]
        }));
    }
    return roadmap.softSkills;
  }, [roadmap.softSkills]);

  return (
    <div className="pb-10">
        <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            {onPreviousLevel && (
                <button 
                    onClick={onPreviousLevel}
                    className="mb-4 text-sm text-slate-400 hover:text-white flex items-center transition-colors bg-slate-800/50 px-3 py-1.5 rounded-lg w-fit"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Previous Level
                </button>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-3xl font-bold">{roadmap.title}</h2>
                        <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded border border-blue-500/30">
                            Target NSQF Level {roadmap.targetNsqfLevel}
                        </span>
                        {roadmap.domain && (
                            <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">
                                {roadmap.domain}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-400 max-w-3xl">{roadmap.description}</p>
                </div>
                
                {/* View Tabs */}
                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 shrink-0 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('technical')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center whitespace-nowrap ${
                        activeTab === 'technical' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Layers size={16} className="mr-2" />
                        Technical Path
                    </button>
                    <button
                        onClick={() => setActiveTab('soft_skills')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center whitespace-nowrap ${
                        activeTab === 'soft_skills' 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <MessageCircle size={16} className="mr-2" />
                        Soft Skills
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center whitespace-nowrap ${
                        activeTab === 'resources' 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Library size={16} className="mr-2" />
                        Resources
                    </button>
                </div>
            </div>
        </motion.header>

        {/* Learning Objectives & Decision Prompts (Always Visible) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {roadmap.learningObjectives && roadmap.learningObjectives.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6"
                >
                    <div className="flex items-center space-x-2 mb-4 text-emerald-400">
                        <Target size={20} />
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Learning Objectives</h3>
                    </div>
                    <ul className="space-y-3">
                        {roadmap.learningObjectives.map((obj, i) => (
                            <li key={i} className="flex items-start text-slate-300 text-sm">
                                <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                                {obj}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {roadmap.decisionPrompts && roadmap.decisionPrompts.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6"
                >
                     <div className="flex items-center space-x-2 mb-4 text-amber-400">
                        <HelpCircle size={20} />
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Decision Prompts</h3>
                    </div>
                     <ul className="space-y-3">
                        {roadmap.decisionPrompts.map((prompt, i) => (
                            <li key={i} className="flex items-start text-slate-300 text-sm italic">
                                <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                                "{prompt}"
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </div>

        <div className="relative">
            {activeTab === 'technical' && (
                <>
                    {/* Vertical Line */}
                    <div className="absolute left-6 md:left-8 top-4 bottom-0 w-0.5 bg-slate-800"></div>

                    <div className="space-y-12">
                        {roadmap.steps.map((step, index) => (
                            <motion.div 
                                key={step.id} 
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative pl-20 md:pl-24 group"
                            >
                                {/* Connector Node */}
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onToggleStep(step.id)}
                                    className={`absolute left-0 top-0 w-12 h-12 md:w-16 md:h-16 rounded-full border-4 flex items-center justify-center transition-all z-10 ${
                                        step.completed 
                                            ? 'bg-[#0f172a] border-green-500 text-green-500' 
                                            : 'bg-[#1e293b] border-slate-700 text-slate-500 hover:border-blue-500 hover:text-blue-400'
                                    }`}
                                >
                                    <AnimatePresence mode="wait">
                                        {step.completed ? (
                                            <motion.div
                                                key="check"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                            >
                                                <CheckCircle2 size={24} />
                                            </motion.div>
                                        ) : (
                                            <motion.span
                                                key="number"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-xl font-bold"
                                            >
                                                {index + 1}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>

                                <div className={`bg-[#1e293b]/50 border rounded-2xl p-6 transition-all duration-300 ${step.completed ? 'border-green-500/30' : 'border-slate-700/50 hover:border-blue-500/30'}`}>
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                                        <div>
                                            <h3 className={`text-xl font-bold mb-1 transition-colors ${step.completed ? 'text-green-400 line-through decoration-green-500/50' : 'text-white'}`}>
                                                {step.title}
                                            </h3>
                                            <p className="text-slate-400 text-sm mb-3">{step.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex items-center text-xs font-medium bg-slate-800 text-slate-300 px-2 py-1 rounded">
                                                    <Award size={12} className="mr-1" /> NSQF L{step.nsqfLevel}
                                                </span>
                                                <span className="inline-flex items-center text-xs font-medium bg-slate-800 text-slate-300 px-2 py-1 rounded">
                                                    <Clock size={12} className="mr-1" /> ~{step.estimatedHours} hrs
                                                </span>
                                            </div>
                                        </div>
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onToggleStep(step.id)}
                                            className={`mt-4 md:mt-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                step.completed 
                                                    ? 'bg-green-500/10 text-green-400' 
                                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                            }`}
                                        >
                                            {step.completed ? 'Completed' : 'Mark Complete'}
                                        </motion.button>
                                    </div>

                                    <div className="mt-6">
                                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Recommended Resources</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {step.resources.map((res, i) => (
                                                <ResourceCard key={i} resource={res} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'soft_skills' && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <div className="col-span-full mb-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl flex items-start gap-3">
                        <Briefcase className="text-purple-400 shrink-0 mt-1" size={20} />
                        <div>
                            <h4 className="text-purple-300 font-bold text-sm">Placement & Career Readiness</h4>
                            <p className="text-purple-200/70 text-sm mt-1">
                                These behavioral skills and qualities are highly valued by recruiters for this role. 
                                Mastering them significantly improves your employability.
                            </p>
                        </div>
                    </div>

                    {normalizedSoftSkills.map((skill, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mr-3">
                                        <Users size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                        {skill.name}
                                    </h3>
                                </div>
                            </div>
                            
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                {skill.description}
                            </p>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Development Resources</h4>
                                {skill.resources.map((res, i) => (
                                    <ResourceCard key={i} resource={res} />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                    
                    {normalizedSoftSkills.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No specific soft skills data available for this roadmap level.</p>
                        </div>
                    )}
                </motion.div>
            )}

            {activeTab === 'resources' && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="bg-emerald-900/10 border border-emerald-500/30 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-emerald-400 mb-2 flex items-center">
                            <Library className="mr-2" size={24} /> 
                            Resource Library
                        </h3>
                        <p className="text-slate-400 text-sm">
                            Access all learning materials from your current and past roadmap levels in one place.
                        </p>
                    </div>

                    {/* Previous Levels */}
                    {roadmapHistory.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Previous Levels</h4>
                            {roadmapHistory.map((histMap, idx) => (
                                <div key={idx} className="mb-8 pl-4 border-l-2 border-slate-700">
                                    <h5 className="text-lg font-bold text-slate-300 mb-4">{histMap.title} (Level {histMap.targetNsqfLevel})</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {histMap.steps.flatMap(s => s.resources).map((res, rIdx) => (
                                            <ResourceCard key={`hist-${idx}-${rIdx}`} resource={res} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Current Level */}
                    <div>
                         <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Current Level Resources</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {roadmap.steps.flatMap(s => s.resources).map((res, rIdx) => (
                                <ResourceCard key={`curr-${rIdx}`} resource={res} />
                            ))}
                             {normalizedSoftSkills.flatMap(s => s.resources).map((res, rIdx) => (
                                <ResourceCard key={`curr-soft-${rIdx}`} resource={res} />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
            
            {/* Completion & Next Level Section - Only on Technical Tab */}
            {activeTab === 'technical' && (
                <div className="pl-20 md:pl-24 pt-12 pb-20">
                    {isAllCompleted ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-8 relative overflow-hidden"
                    >
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Sparkles size={80} className="text-yellow-400" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2 text-white">Level Complete! 🎉</h3>
                                <p className="text-slate-300 mb-6 max-w-xl">
                                    You've mastered this level. To keep growing, tell us what you'd like to learn next.
                                    We'll generate a new plan to take you to NSQF Level {roadmap.targetNsqfLevel + 1}.
                                </p>
                                
                                <div className="flex flex-col md:flex-row gap-3 max-w-xl">
                                    <input 
                                        type="text" 
                                        value={nextFocus}
                                        onChange={(e) => setNextFocus(e.target.value)}
                                        placeholder={`e.g., Advanced ${roadmap.domain} concepts...`}
                                        className="flex-1 bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onNextLevel && onNextLevel(nextFocus || `Advanced ${roadmap.domain}`)}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 whitespace-nowrap"
                                    >
                                        Start Next Level <ArrowRight size={18} className="ml-2" />
                                    </motion.button>
                                </div>
                            </div>
                    </motion.div>
                    ) : (
                        <div className="flex items-center text-slate-500">
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center absolute left-0 bg-[#0f172a] z-10">
                                <Award size={24} />
                            </div>
                            <p className="italic">Goal Achieved! Continue to next level.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
    return (
        <motion.a 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 1)" }}
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 transition-all group cursor-pointer"
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 shrink-0 ${
                resource.priority === 'high' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-400'
            }`}>
                <BookOpen size={18} />
            </div>
            <div className="flex-1 overflow-hidden">
                <h5 className="text-sm font-medium text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                    {resource.title}
                </h5>
                <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        resource.isPaid ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                    }`}>
                        {resource.isPaid ? 'Paid' : 'Free'}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{resource.type}</span>
                </div>
            </div>
            <ExternalLink size={14} className="text-slate-600 group-hover:text-blue-400 ml-2" />
        </motion.a>
    )
}