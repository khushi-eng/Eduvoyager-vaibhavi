import React from 'react';
import { User, UserStats, Roadmap } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Zap, Award, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { DailyTasksWidget } from './DailyTasksWidget';

interface DashboardProps {
  user: User;
  stats: UserStats;
  roadmap: Roadmap | null;
  onNavigate: (view: any) => void;
  onUpdateStats?: (xp: number) => void; // Optional for now to keep backward compat if needed, but we'll use it
}

export const Dashboard: React.FC<DashboardProps> = ({ user, stats, roadmap, onNavigate, onUpdateStats }) => {
  
  if (!roadmap) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Target size={64} className="text-slate-600 mb-6 mx-auto animate-float" />
              <h2 className="text-2xl font-bold mb-2">No active roadmap</h2>
              <p className="text-slate-400 mb-6">Take the assessment to generate your personalized learning path.</p>
              <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('assessment')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-900/20"
              >
                  Start Assessment
              </motion.button>
            </motion.div>
        </div>
    )
  }

  const completedSteps = roadmap.steps.filter(s => s.completed).length;
  // Find the first incomplete step to drive the daily tasks
  const activeStep = roadmap.steps.find(s => !s.completed) || roadmap.steps[roadmap.steps.length - 1];

  // Dynamic chart data based on current stats
  const chartData = [
    { name: 'Mon', xp: 0 },
    { name: 'Tue', xp: 0 },
    { name: 'Wed', xp: 0 },
    { name: 'Thu', xp: 0 },
    { name: 'Fri', xp: 0 },
    { name: 'Sat', xp: 0 },
    { name: 'Today', xp: stats.xp },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Helper to safely update stats if prop provided
  const handleStatUpdate = (xpGain: number) => {
    if (onUpdateStats) {
        onUpdateStats(xpGain);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold mb-1">Hello, {user.firstName}! 👋</h2>
                <p className="text-slate-400">You're making great progress on <span className="text-blue-400 font-medium">{roadmap.title}</span>.</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="bg-slate-800/80 px-4 py-2 rounded-xl flex items-center border border-slate-700 shadow-md"
                >
                    <Flame className="text-orange-500 mr-2" size={20} />
                    <div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Streak</div>
                        <div className="font-bold">{stats.streak} Days</div>
                    </div>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="bg-slate-800/80 px-4 py-2 rounded-xl flex items-center border border-slate-700 shadow-md"
                >
                    <Zap className="text-yellow-500 mr-2" size={20} />
                    <div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Total XP</div>
                        <div className="font-bold">{stats.xp}</div>
                    </div>
                </motion.div>
            </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Stats & Chart */}
            <div className="lg:col-span-2 space-y-8">
                 {/* Daily Tasks Widget - New Feature */}
                 <motion.div variants={itemVariants}>
                    <DailyTasksWidget activeStep={activeStep} onUpdateStats={handleStatUpdate} />
                 </motion.div>

                {/* Chart Section */}
                <motion.div 
                variants={itemVariants}
                className="bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold mb-6">Learning Activity</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#60a5fa' }}
                                    cursor={{ stroke: '#475569', strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" animationDuration={1500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Right Column - Overview Cards */}
            <div className="space-y-6">
                <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-900/10"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110 transform">
                        <Award size={80} />
                    </div>
                    <h3 className="text-slate-400 text-sm font-semibold uppercase mb-2">Current Level</h3>
                    <div className="text-4xl font-bold text-white mb-1">NSQF L{stats.currentNsqfLevel}</div>
                    <p className="text-sm text-blue-300">Targeting Level {roadmap.targetNsqfLevel}</p>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                        <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.currentNsqfLevel/10)*100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-blue-500 h-1.5 rounded-full"
                        />
                    </div>
                </motion.div>

                <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 hover:bg-[#1e293b]/80"
                >
                    <h3 className="text-slate-400 text-sm font-semibold uppercase mb-2">Modules Completed</h3>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-bold text-white">{completedSteps}</span>
                        <span className="text-slate-500">/ {roadmap.steps.length}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                        {roadmap.steps.length - completedSteps} steps remaining to reach your goal.
                    </p>
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => onNavigate('games')}
                    className="bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-800 hover:shadow-xl hover:border-purple-500/30 group"
                >
                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Zap size={24} />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-purple-300 transition-colors">Daily Revision</h3>
                    <p className="text-sm text-slate-400">Play a quick game to boost your memory.</p>
                </motion.div>
            </div>
        </div>
    </motion.div>
  );
};