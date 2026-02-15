import React, { useState, useEffect } from 'react';
import { Task, RoadmapStep } from '../types';
import { generateDailyTasks } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, RefreshCw, Trophy } from 'lucide-react';
import { Skeleton } from './Skeleton';

interface DailyTasksWidgetProps {
  activeStep: RoadmapStep;
  onUpdateStats: (xp: number) => void;
}

export const DailyTasksWidget: React.FC<DailyTasksWidgetProps> = ({ activeStep, onUpdateStats }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingMore, setAddingMore] = useState(false);
  const [dayCompleted, setDayCompleted] = useState(false);

  useEffect(() => {
    // In a real app, check DB for today's plan first.
    // Here we generate fresh if empty.
    const initTasks = async () => {
      setLoading(true);
      const generated = await generateDailyTasks(activeStep.title, activeStep.description, 3);
      setTasks(generated);
      setLoading(false);
    };

    if (activeStep) {
        initTasks();
    }
  }, [activeStep.id]);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newState = !t.isCompleted;
        if (newState) onUpdateStats(10); // 10 XP per task
        return { ...t, isCompleted: newState };
      }
      return t;
    }));
  };

  const handleAddMore = async () => {
    setAddingMore(true);
    const newTasks = await generateDailyTasks(activeStep.title, activeStep.description, 2);
    const labeledNewTasks = newTasks.map(t => ({...t, type: 'bonus' as const}));
    setTasks(prev => [...prev, ...labeledNewTasks]);
    setAddingMore(false);
  };

  const handleCompleteDay = () => {
    setDayCompleted(true);
    onUpdateStats(50); // Bonus 50 XP for finishing the day
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const allCoreCompleted = tasks.filter(t => t.type === 'core').every(t => t.isCompleted);

  if (loading) {
    return (
      <div className="bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-12" />
        </div>
        <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl p-6 mb-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
         <Trophy size={120} />
      </div>

      <div className="flex justify-between items-end mb-4 relative z-10">
        <div>
            <h3 className="text-xl font-bold text-white flex items-center">
                Today's Focus
                {dayCompleted && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">Day Complete!</span>}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
                Aligning with: <span className="text-blue-400 font-medium">{activeStep.title}</span>
            </p>
        </div>
        <div className="text-right">
            <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
            <div className="text-xs text-slate-500 uppercase font-bold">Progress</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-800 rounded-full mb-6 overflow-hidden">
        <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
        />
      </div>

      {/* Tasks List */}
      <div className="space-y-3 relative z-10">
        <AnimatePresence>
            {tasks.map((task) => (
                <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                    className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer group ${
                        task.isCompleted 
                            ? 'bg-slate-800/30 border-slate-800' 
                            : 'bg-slate-800/80 border-slate-700 hover:border-blue-500/50'
                    }`}
                    onClick={() => !dayCompleted && toggleTask(task.id)}
                >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-4 transition-all duration-300 shrink-0 ${
                        task.isCompleted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-slate-500 group-hover:border-blue-400'
                    }`}>
                        {task.isCompleted && <Check size={14} strokeWidth={3} />}
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm transition-all ${
                            task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'
                        }`}>
                            {task.text}
                        </p>
                        {task.type === 'bonus' && <span className="text-[10px] uppercase font-bold text-purple-400">Bonus</span>}
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3 relative z-10">
        {!dayCompleted ? (
            <>
                <button 
                    onClick={handleAddMore}
                    disabled={addingMore}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium flex items-center transition-colors border border-slate-700"
                >
                    {addingMore ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Plus size={16} className="mr-2" />}
                    Add More Tasks
                </button>
                
                <motion.button 
                    disabled={!allCoreCompleted}
                    onClick={handleCompleteDay}
                    whileHover={allCoreCompleted ? { scale: 1.05 } : {}}
                    whileTap={allCoreCompleted ? { scale: 0.95 } : {}}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center ml-auto transition-all ${
                        allCoreCompleted 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-900/20' 
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                >
                    <Trophy size={16} className="mr-2" />
                    Complete Day
                </motion.button>
            </>
        ) : (
             <div className="w-full bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center text-green-400 text-sm font-bold">
                Daily Goal Achieved! +50 XP
             </div>
        )}
      </div>
    </div>
  );
};