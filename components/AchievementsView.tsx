import React, { useState } from 'react';
import { User, UserStats, Badge, LeaderboardEntry } from '../types';
import { BADGES, getLeaderboardData } from '../services/gamification';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Lock, Star, Flame, Target, Footprints, GraduationCap, BookOpen, Shield } from 'lucide-react';

interface AchievementsViewProps {
  user: User;
  stats: UserStats;
}

const IconMap: Record<string, any> = {
  Trophy, Medal, Crown, Star, Flame, Target, Footprints, GraduationCap, BookOpen, Shield
};

export const AchievementsView: React.FC<AchievementsViewProps> = ({ user, stats }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges'>('leaderboard');
  const leaderboardData = getLeaderboardData(user, stats);

  const userRank = leaderboardData.find(e => e.isCurrentUser)?.rank || '-';

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">Achievements & Rankings</h2>
          <p className="text-slate-400">Compete with peers and unlock badges as you learn.</p>
        </div>
        
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${
              activeTab === 'leaderboard' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy size={16} className="mr-2" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${
              activeTab === 'badges' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Medal size={16} className="mr-2" />
            My Badges
          </button>
        </div>
      </div>

      {activeTab === 'leaderboard' ? (
        <LeaderboardTable data={leaderboardData} />
      ) : (
        <BadgesGrid earnedBadgeIds={stats.badges} />
      )}
    </div>
  );
};

const LeaderboardTable: React.FC<{ data: LeaderboardEntry[] }> = ({ data }) => {
  return (
    <div className="bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700/50 bg-slate-800/30">
            <div className="col-span-2 md:col-span-1 text-center">Rank</div>
            <div className="col-span-6 md:col-span-5">Learner</div>
            <div className="col-span-2 hidden md:block text-center">Badges</div>
            <div className="col-span-4 md:col-span-4 text-right pr-4">Total XP</div>
        </div>
        <div className="divide-y divide-slate-800/50">
            {data.map((entry, index) => (
                <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${
                        entry.isCurrentUser ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'hover:bg-slate-800/30'
                    }`}
                >
                    <div className="col-span-2 md:col-span-1 flex justify-center">
                        {entry.rank === 1 ? (
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500">
                                <Crown size={18} />
                            </div>
                        ) : entry.rank === 2 ? (
                            <div className="w-8 h-8 bg-slate-400/20 rounded-full flex items-center justify-center text-slate-300">
                                <Medal size={18} />
                            </div>
                        ) : entry.rank === 3 ? (
                            <div className="w-8 h-8 bg-orange-700/20 rounded-full flex items-center justify-center text-orange-400">
                                <Medal size={18} />
                            </div>
                        ) : (
                            <span className="font-mono text-slate-400 font-bold">#{entry.rank}</span>
                        )}
                    </div>
                    <div className="col-span-6 md:col-span-5 flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${entry.avatarColor}`}>
                            {entry.name.charAt(0)}
                        </div>
                        <div>
                            <div className={`font-medium ${entry.isCurrentUser ? 'text-blue-400' : 'text-slate-200'}`}>
                                {entry.name} {entry.isCurrentUser && '(You)'}
                            </div>
                            <div className="text-xs text-slate-500">{entry.designation}</div>
                        </div>
                    </div>
                    <div className="col-span-2 hidden md:flex justify-center items-center space-x-1 text-slate-400">
                        <Medal size={14} />
                        <span>{entry.badgesCount}</span>
                    </div>
                    <div className="col-span-4 md:col-span-4 text-right pr-4 font-mono font-bold text-slate-200">
                        {entry.xp.toLocaleString()} XP
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
  );
}

const BadgesGrid: React.FC<{ earnedBadgeIds: string[] }> = ({ earnedBadgeIds }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {BADGES.map((badge) => {
        const isUnlocked = earnedBadgeIds.includes(badge.id);
        const Icon = IconMap[badge.icon] || Star;
        
        return (
            <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className={`relative p-6 rounded-2xl border flex items-start gap-4 overflow-hidden group ${
                    isUnlocked 
                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' 
                        : 'bg-slate-900/40 border-slate-800 opacity-60 grayscale'
                }`}
            >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                    isUnlocked 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                        : 'bg-slate-800 text-slate-600'
                }`}>
                    {isUnlocked ? <Icon size={28} /> : <Lock size={24} />}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{badge.name}</h4>
                        {isUnlocked && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/20">Unlocked</span>}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{badge.description}</p>
                    <div className="mt-3 flex items-center text-xs font-medium text-slate-500">
                        <Star size={12} className="mr-1 text-yellow-500" />
                        +{badge.xpBonus} XP Reward
                    </div>
                </div>

                {isUnlocked && (
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
                )}
            </motion.div>
        );
      })}
    </div>
  );
}