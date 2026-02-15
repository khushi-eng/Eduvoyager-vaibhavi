import React, { useState, useEffect } from 'react';
import { generateGameQuestions } from '../services/gemini';
import { GameQuestion, UserStats } from '../types';
import { Brain, Trophy, AlertCircle, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GamesProps {
  topic: string; // usually derived from current roadmap step
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

export const Games: React.FC<GamesProps> = ({ topic, userStats, onUpdateStats }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    setGameFinished(false);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    
    // Fallback topic if none provided
    const searchTopic = topic || "General Professional Skills";
    const qs = await generateGameQuestions(searchTopic, difficulty);
    setQuestions(qs);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, [difficulty]); // Refetch when difficulty changes

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);

    if (index === questions[currentQIndex].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameFinished(true);
    // Update global stats
    const xpGain = score * (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10);
    onUpdateStats({
      ...userStats,
      xp: userStats.xp + xpGain,
      streak: userStats.streak + 1 // Simply increment streak for playing
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw className="animate-spin text-blue-500 mb-4" size={32} />
        <p className="text-slate-400">Constructing challenge...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
        <div className="text-center p-10">
            <p>Could not load questions. Try refreshing or changing difficulty.</p>
            <button onClick={fetchQuestions} className="mt-4 text-blue-400">Retry</button>
        </div>
    )
  }

  if (gameFinished) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md mx-auto text-center p-8 bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl"
      >
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy size={40} className="text-yellow-500" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
        <p className="text-slate-400 mb-6">You scored {score} out of {questions.length}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-500 uppercase">XP Earned</div>
                <div className="text-2xl font-bold text-blue-400">+{score * (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10)}</div>
            </div>
             <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-500 uppercase">Accuracy</div>
                <div className="text-2xl font-bold text-green-400">{Math.round((score/questions.length)*100)}%</div>
            </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchQuestions}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Play Again
        </motion.button>
      </motion.div>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="mr-2 text-purple-400" />
            Skill Arcade
          </h2>
          <p className="text-slate-400 text-sm mt-1">Topic: {topic || "General Knowledge"}</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
          {(['easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              disabled={loading}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                difficulty === level 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full mb-8">
        <motion.div 
          className="h-full bg-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div 
            key={currentQIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl p-6 md:p-10 shadow-xl relative overflow-hidden"
        >
            <span className="absolute top-4 right-4 text-xs font-bold text-slate-600">Q{currentQIndex + 1}/{questions.length}</span>
            
            <h3 className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
            {currentQ.question}
            </h3>

            <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
                let stateStyle = "bg-slate-800 border-slate-700 hover:bg-slate-750 hover:border-slate-600";
                
                if (showResult) {
                    if (idx === currentQ.correctAnswerIndex) {
                        stateStyle = "bg-green-500/10 border-green-500 text-green-400";
                    } else if (idx === selectedOption) {
                        stateStyle = "bg-red-500/10 border-red-500 text-red-400";
                    } else {
                        stateStyle = "bg-slate-800/50 border-slate-700 opacity-50";
                    }
                } else if (selectedOption === idx) {
                    stateStyle = "bg-blue-500/20 border-blue-500 text-blue-300";
                }

                return (
                <motion.button
                    key={idx}
                    whileHover={!showResult ? { scale: 1.01 } : {}}
                    whileTap={!showResult ? { scale: 0.99 } : {}}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group ${stateStyle}`}
                >
                    <span>{option}</span>
                    {showResult && idx === currentQ.correctAnswerIndex && <CheckCircle size={20} className="text-green-500" />}
                    {showResult && idx === selectedOption && idx !== currentQ.correctAnswerIndex && <XCircle size={20} className="text-red-500" />}
                </motion.button>
                );
            })}
            </div>

            {/* Explanation & Next Button */}
            {showResult && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 pt-6 border-t border-slate-700/50"
            >
                <div className="flex items-start gap-3 mb-6">
                    <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-300 leading-relaxed">
                        <span className="font-semibold text-blue-400 block mb-1">Explanation:</span>
                        {currentQ.explanation}
                    </p>
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="w-full md:w-auto px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center ml-auto"
                >
                    {currentQIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
                    <ArrowRight size={18} className="ml-2" />
                </motion.button>
            </motion.div>
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};