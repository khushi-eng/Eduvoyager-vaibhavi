import React, { useEffect, useState } from 'react';
import { generateJobs } from '../services/gemini';
import { Job, User, Roadmap } from '../types';
import { Briefcase, MapPin, DollarSign, ExternalLink, Search, Building2 } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { motion } from 'framer-motion';

interface JobsProps {
  user: User;
  roadmap: Roadmap | null;
}

const MatchScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Color logic
  let color = 'text-emerald-500'; 
  let textColor = 'text-emerald-400';
  
  if (score < 80) {
      color = 'text-amber-500';
      textColor = 'text-amber-400';
  }
  if (score < 50) {
      color = 'text-rose-500';
      textColor = 'text-rose-400';
  }

  return (
    <div className="flex items-center gap-3 bg-slate-900/40 pr-4 pl-1 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm shrink-0">
        <div className="relative w-11 h-11 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className="text-slate-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="22"
                    cy="22"
                />
                {/* Progress Circle */}
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className={color}
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    fill="transparent"
                    stroke="currentColor"
                    r={radius}
                    cx="22"
                    cy="22"
                />
            </svg>
            <span className={`absolute text-[11px] font-bold ${textColor}`}>{score}%</span>
        </div>
        <div className="flex flex-col">
            <span className={`text-xs font-bold ${textColor} leading-tight`}>Match</span>
            <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Score</span>
        </div>
    </div>
  );
};

export const Jobs: React.FC<JobsProps> = ({ user, roadmap }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      // Derive skills from roadmap titles or default to user designation
      const skills = roadmap 
        ? roadmap.steps.slice(0, 3).map(s => s.title) 
        : [user.designation, "General Skills"];
      
      const results = await generateJobs(user.designation, skills);
      setJobs(results);
      setLoading(false);
    };

    if (user) {
      fetchJobs();
    }
  }, [user, roadmap]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
             <div className="space-y-2">
                 <Skeleton className="h-10 w-48" />
                 <Skeleton className="h-5 w-96" />
             </div>
         </div>
         <div className="space-y-6">
             {[1, 2, 3].map((i) => (
                 <div key={i} className="bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl p-6">
                     <div className="flex flex-col md:flex-row justify-between gap-6">
                         <div className="flex-1 space-y-4">
                             <div className="flex justify-between">
                                 <Skeleton className="h-7 w-64" />
                                 <Skeleton className="h-6 w-24 rounded-full" />
                             </div>
                             <div className="flex gap-4">
                                 <Skeleton className="h-5 w-32" />
                                 <Skeleton className="h-5 w-32" />
                                 <Skeleton className="h-5 w-32" />
                             </div>
                             <div className="flex gap-2 pt-2">
                                 <Skeleton className="h-6 w-20" />
                                 <Skeleton className="h-6 w-20" />
                                 <Skeleton className="h-6 w-20" />
                             </div>
                         </div>
                         <div className="w-32 flex flex-col items-end gap-2">
                             <Skeleton className="h-5 w-24" />
                             <Skeleton className="h-10 w-full rounded-xl" />
                         </div>
                     </div>
                 </div>
             ))}
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">Career Hub</h2>
          <p className="text-slate-400">
            Jobs curated for you based on your current skills and roadmap progress.
          </p>
        </div>
        <div className="bg-slate-800 p-2 rounded-lg flex items-center text-sm text-slate-400 border border-slate-700">
           <Search size={16} className="mr-2" />
           <span>Matches found: {jobs.length}</span>
        </div>
      </div>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 gap-6"
      >
        {jobs.map((job) => (
          <motion.div 
            key={job.id} 
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
            className="bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/10"></div>
            
            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mr-4">{job.title}</h3>
                    {/* Replaced Text Badge with MatchScoreRing */}
                    <div className="md:hidden">
                         <MatchScoreRing score={job.matchScore} />
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                  <div className="flex items-center">
                    <Building2 size={16} className="mr-1.5 text-slate-500" />
                    {job.company}
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1.5 text-slate-500" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <DollarSign size={16} className="mr-1.5 text-slate-500" />
                    {job.salaryRange}
                  </div>
                  <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300">
                    {job.type}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700/50 group-hover:border-slate-600 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between items-end gap-3 min-w-[140px]">
                {/* Desktop Match Score */}
                <div className="hidden md:block">
                     <MatchScoreRing score={job.matchScore} />
                </div>

                <div className="flex flex-col items-end w-full gap-3 mt-auto">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded self-end ${
                        job.platform === 'LinkedIn' ? 'bg-[#0077b5]/10 text-[#0077b5]' : 
                        job.platform === 'Indeed' ? 'bg-[#2164f3]/10 text-[#2164f3]' : 
                        'bg-slate-700 text-slate-300'
                    }`}>
                        Via {job.platform}
                    </span>
                    <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                    >
                    Apply Now
                    <ExternalLink size={16} className="ml-2" />
                    </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
