import React, { useState } from 'react';
import { User } from '../types';
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { loginUser, registerUser } from '../services/storage';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    designation: '',
    educationStage: 'discovery',
    age: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Map dropdown to designation label if needed
    let finalStage: User['educationStage'] = 'discovery';
    
    // Map selection to stage logic
    switch(formData.designation) {
        case 'Under 10th Grade': finalStage = 'discovery'; break;
        case 'Class 11-12': finalStage = 'direction'; break;
        case 'College / Graduate': finalStage = 'commitment'; break;
        case 'Working Professional': finalStage = 'progression'; break;
        default: finalStage = 'discovery';
    }

    if (isSignUp) {
        const newUser: User = {
            firstName: formData.firstName || 'Alex',
            lastName: formData.lastName || 'Doe',
            email: formData.email,
            designation: formData.designation || 'Student',
            educationStage: finalStage,
            age: parseInt(formData.age) || 15,
        };

        const success = registerUser(newUser, formData.password);
        if (success) {
            onLogin(newUser);
        } else {
            setError('Account already exists with this email.');
        }
    } else {
        const user = loginUser(formData.email, formData.password);
        if (user) {
            onLogin(user);
        } else {
            setError('Invalid email or password.');
        }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f172a] text-white">
      {/* Left Side - Hero */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden group">
        
        {/* Background Image with Ken Burns Effect */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.pexels.com/photos/6592753/pexels-photo-6592753.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="People working in office" 
                className="w-full h-full object-cover animate-zoom-slow opacity-90"
            />
            {/* Professional Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-blue-900/40 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/90 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-2 mb-8"
          >
            <div className="w-10 h-10 bg-blue-600/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-blue-400/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">EduVoyager</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold leading-tight mb-6 drop-shadow-lg"
          >
            Guidance you can <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">trust</span>,<br/>
            at your own pace.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-300 max-w-md leading-relaxed drop-shadow-md"
          >
            AI-guided, NSQF-aligned learning roadmaps that help you choose the right path, build real skills, and track your progress.
          </motion.p>
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
        >
            <div className="bg-[#1e293b]/60 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-default">
                <ShieldCheck className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={24} />
                <h3 className="font-semibold text-lg mb-1 text-white">NSQF Aligned</h3>
                <p className="text-sm text-slate-300">Standardized skill levels for recognized growth.</p>
            </div>
            <div className="bg-[#1e293b]/60 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-default">
                <TrendingUp className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={24} />
                <h3 className="font-semibold text-lg mb-1 text-white">Smart Tracking</h3>
                <p className="text-sm text-slate-300">Visual progress and gamified milestones.</p>
            </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#0b1120] relative z-20">
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
        >
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-2 text-white">{isSignUp ? 'Start Your Journey' : 'Welcome Back'}</h2>
                <p className="text-slate-400">
                    {isSignUp ? 'Create an account to build your roadmap.' : 'Enter your details to access your progress.'}
                </p>
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center text-sm"
                >
                    <AlertCircle size={18} className="mr-2 shrink-0" />
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">First Name</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-600 focus:bg-slate-800/80"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={e => setFormData({...formData, firstName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Name</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-600 focus:bg-slate-800/80"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={e => setFormData({...formData, lastName: e.target.value})}
                            />
                        </div>
                    </motion.div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                    <input 
                        required
                        type="email" 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-600 focus:bg-slate-800/80"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                    <input 
                        required
                        type="password" 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-600 focus:bg-slate-800/80"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                </div>

                {isSignUp && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-3 gap-4"
                    >
                         <div className="col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Stage</label>
                            <select 
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white appearance-none cursor-pointer hover:bg-slate-750"
                                value={formData.designation}
                                onChange={e => setFormData({...formData, designation: e.target.value})}
                            >
                                <option value="" disabled>Select Stage...</option>
                                <option value="Under 10th Grade">Student (Under 10th) - Discovery</option>
                                <option value="Class 11-12">Student (11-12) - Direction</option>
                                <option value="College / Graduate">College / Grad - Commitment</option>
                                <option value="Working Professional">Working - Progression</option>
                            </select>
                        </div>
                         <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Age</label>
                            <input 
                                required
                                type="number" 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-600"
                                placeholder="Age"
                                value={formData.age}
                                onChange={e => setFormData({...formData, age: e.target.value})}
                            />
                        </div>
                    </motion.div>
                )}

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/20 flex items-center justify-center group"
                >
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-slate-400">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button 
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                        }}
                        className="ml-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline underline-offset-4"
                    >
                        {isSignUp ? 'Log in' : 'Sign up'}
                    </button>
                </p>
            </div>
        </motion.div>
      </div>
    </div>
  );
};