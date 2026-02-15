import React, { useState } from 'react';
import { ViewState, User } from '../types';
import { LayoutDashboard, Map, Gamepad2, LogOut, User as UserIcon, Menu, Briefcase, MessageSquarePlus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeleteAccountModal } from './DeleteAccountModal';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  onDeleteAccount: (reason: string) => void;
  onOpenFeedback: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  currentView, 
  onNavigate, 
  onLogout,
  onDeleteAccount,
  onOpenFeedback
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (currentView === 'auth') return <>{children}</>;

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          onNavigate(view);
          setIsMobileMenuOpen(false);
        }}
        className="relative flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group"
      >
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-xl"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center">
            <Icon size={20} className={`mr-3 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-200'}`} />
            <span className={`font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>{label}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] text-slate-100 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1e293b]/50 backdrop-blur-xl border-r border-slate-700/50 p-6 h-screen sticky top-0">
        <div className="mb-10 flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Map size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            EduVoyager
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="roadmap" icon={Map} label="My Roadmap" />
          <NavItem view="games" icon={Gamepad2} label="Skill Arcade" />
          <NavItem view="jobs" icon={Briefcase} label="Career Hub" />
        </nav>

        <div className="pt-6 border-t border-slate-700/50 space-y-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenFeedback}
            className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
             <MessageSquarePlus size={16} className="mr-2" />
             Give Feedback
          </motion.button>
          
          <div className="flex items-center px-4 py-3 rounded-xl bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3">
              <UserIcon size={14} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser?.firstName}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.designation}</p>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ x: 3 }}
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </motion.button>

          <motion.button 
            whileHover={{ x: 3 }}
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center w-full px-4 py-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="mr-2" />
            Delete Account
          </motion.button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Map size={18} className="text-white" />
          </div>
          <span className="font-bold">EduVoyager</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-0 z-40 bg-[#0f172a] pt-20 px-6 space-y-4 md:hidden overflow-y-auto"
            >
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="roadmap" icon={Map} label="My Roadmap" />
            <NavItem view="games" icon={Gamepad2} label="Skill Arcade" />
            <NavItem view="jobs" icon={Briefcase} label="Career Hub" />
            <button 
                onClick={() => {
                    onOpenFeedback();
                    setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl"
            >
                <MessageSquarePlus size={20} className="mr-3" />
                Give Feedback
            </button>

            <div className="pt-8 pb-8 border-t border-slate-800 space-y-3">
                <button 
                onClick={onLogout}
                className="flex items-center w-full px-4 py-3 text-slate-300 bg-slate-800 rounded-xl"
                >
                <LogOut size={20} className="mr-3" />
                Sign Out
                </button>

                <button 
                onClick={() => {
                    setIsDeleteModalOpen(true);
                    setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-red-400 bg-red-500/10 rounded-xl"
                >
                <Trash2 size={20} className="mr-3" />
                Delete Account
                </button>
            </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen scroll-smooth pt-20 md:pt-0">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Modals */}
      <DeleteAccountModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={(reason) => {
            onDeleteAccount(reason);
            setIsDeleteModalOpen(false);
        }} 
      />
    </div>
  );
};