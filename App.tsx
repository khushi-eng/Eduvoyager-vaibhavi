import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Assessment } from './components/Assessment';
import { Dashboard } from './components/Dashboard';
import { RoadmapView } from './components/RoadmapView';
import { Games } from './components/Games';
import { Jobs } from './components/Jobs';
import { FeedbackModal } from './components/FeedbackModal';
import { User, Roadmap, ViewState, UserStats } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { generateNextLevelRoadmap } from './services/gemini';
import { checkForNewBadges } from './services/gamification';
import { getCurrentSession, getUserData, logoutUser, deleteUser, updateUserHistory, updateUserRoadmap, updateUserStats } from './services/storage';
import { Loader2 } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [roadmapHistory, setRoadmapHistory] = useState<Roadmap[]>([]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  // Stats state
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    streak: 0, 
    completedModules: 0,
    currentNsqfLevel: 0,
    badges: []
  });

  // Hydrate from Storage on Mount
  useEffect(() => {
    const sessionEmail = getCurrentSession();
    if (sessionEmail) {
        const userData = getUserData(sessionEmail);
        if (userData) {
            setCurrentUser(userData.profile);
            setStats(userData.stats);
            setRoadmap(userData.currentRoadmap);
            setRoadmapHistory(userData.roadmapHistory);
            
            if (userData.currentRoadmap) {
                setCurrentView('dashboard');
            } else {
                setCurrentView('assessment');
            }
        }
    }
    setIsLoadingSession(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Fetch data for the newly logged in user
    const userData = getUserData(user.email);
    if (userData) {
        setStats(userData.stats);
        setRoadmap(userData.currentRoadmap);
        setRoadmapHistory(userData.roadmapHistory);
        if (userData.currentRoadmap) {
            setCurrentView('dashboard');
        } else {
            setCurrentView('assessment');
        }
    } else {
        // Fallback for brand new registration not fully saved yet (edge case)
        setCurrentView('assessment');
    }
  };

  const handleAssessmentComplete = (newRoadmap: Roadmap) => {
    if (!currentUser) return;

    setRoadmap(newRoadmap);
    setRoadmapHistory([]); 
    
    // Initial stats setup
    const newStats = {
        ...stats,
        currentNsqfLevel: Math.max(1, newRoadmap.targetNsqfLevel - 4)
    };
    setStats(newStats);
    
    // Save to storage
    updateUserRoadmap(currentUser.email, newRoadmap);
    updateUserStats(currentUser.email, newStats);
    updateUserHistory(currentUser.email, []);

    setCurrentView('dashboard');
  };

  const handleNextLevel = async (nextFocus: string) => {
    if (!roadmap || !currentUser) return;
    
    setCurrentView('loading_roadmap');
    
    try {
        const nextRoadmap = await generateNextLevelRoadmap(roadmap, nextFocus);
        
        // Update history
        const newHistory = [...roadmapHistory, roadmap];
        setRoadmapHistory(newHistory);
        setRoadmap(nextRoadmap);
        
        // Update stats
        const newStats = {
            ...stats,
            currentNsqfLevel: nextRoadmap.targetNsqfLevel - 1
        };
        setStats(newStats);

        // Persist
        updateUserHistory(currentUser.email, newHistory);
        updateUserRoadmap(currentUser.email, nextRoadmap);
        updateUserStats(currentUser.email, newStats);

        setCurrentView('roadmap');
    } catch (error) {
        console.error("Failed to generate next level", error);
        setCurrentView('dashboard');
    }
  };

  const handlePreviousLevel = () => {
    if (roadmapHistory.length === 0 || !currentUser) return;
    
    const previousRoadmap = roadmapHistory[roadmapHistory.length - 1];
    const newHistory = roadmapHistory.slice(0, -1);
    
    setRoadmap(previousRoadmap);
    setRoadmapHistory(newHistory);
    
    // Persist
    updateUserRoadmap(currentUser.email, previousRoadmap);
    updateUserHistory(currentUser.email, newHistory);
  };

  const toggleRoadmapStep = (stepId: string) => {
    if (!roadmap || !currentUser) return;

    const updatedSteps = roadmap.steps.map(step => {
        if (step.id === stepId) {
            return { ...step, completed: !step.completed };
        }
        return step;
    });

    const updatedRoadmap = { ...roadmap, steps: updatedSteps };
    setRoadmap(updatedRoadmap);
    
    // Persist Roadmap
    updateUserRoadmap(currentUser.email, updatedRoadmap);
    
    // Update stats based on completion
    const step = roadmap.steps.find(s => s.id === stepId);
    
    if (step && !step.completed) { // If marking as complete
         updateStatsFromDashboard(100, 1);
    }
  };

  const updateStatsFromDashboard = (xpGain: number, moduleCountIncrease: number = 0) => {
      if (!currentUser) return;

      const newStats = {
          ...stats,
          xp: stats.xp + xpGain,
          completedModules: stats.completedModules + moduleCountIncrease,
          streak: stats.streak === 0 ? 1 : stats.streak
      };

      // Check for new badges
      const newBadges = checkForNewBadges(newStats);
      if (newBadges.length > 0) {
          const newBadgeIds = newBadges.map(b => b.id);
          const totalBonusXP = newBadges.reduce((sum, b) => sum + b.xpBonus, 0);
          
          newStats.badges = [...newStats.badges, ...newBadgeIds];
          newStats.xp += totalBonusXP; 
      }
      
      setStats(newStats);
      updateUserStats(currentUser.email, newStats);
  };

  const handleLogout = () => {
      logoutUser();
      setCurrentUser(null);
      setCurrentView('auth');
      // Reset local state
      setRoadmap(null);
      setRoadmapHistory([]);
      setStats({ xp: 0, streak: 0, completedModules: 0, currentNsqfLevel: 0, badges: [] });
  };

  const handleDeleteAccount = (reason: string) => {
      if (currentUser) {
          console.log(`User ${currentUser.email} deleted account. Reason: ${reason}`);
          deleteUser(currentUser.email);
          handleLogout();
      }
  };

  const renderContent = () => {
    if (isLoadingSession) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0f172a]">
                <Loader2 size={48} className="text-blue-500 animate-spin" />
            </div>
        );
    }

    switch (currentView) {
      case 'assessment':
        return currentUser ? (
          <Assessment user={currentUser} onComplete={handleAssessmentComplete} />
        ) : null;
      case 'dashboard':
        return currentUser ? (
          <Dashboard 
            user={currentUser} 
            stats={stats} 
            roadmap={roadmap} 
            onNavigate={setCurrentView} 
            onUpdateStats={(xp) => updateStatsFromDashboard(xp)}
          />
        ) : null;
      case 'roadmap':
        return roadmap ? (
          <RoadmapView 
            roadmap={roadmap}
            roadmapHistory={roadmapHistory} 
            onToggleStep={toggleRoadmapStep} 
            onNextLevel={handleNextLevel}
            onPreviousLevel={roadmapHistory.length > 0 ? handlePreviousLevel : undefined}
          />
        ) : (
           <div className="flex flex-col items-center justify-center h-full text-center">
             <p className="text-slate-400 mb-4">No roadmap generated yet.</p>
             <button onClick={() => setCurrentView('assessment')} className="text-blue-400 hover:underline">Go to Assessment</button>
           </div>
        );
      case 'games':
        const nextStep = roadmap?.steps.find(s => !s.completed);
        const topic = nextStep ? nextStep.title : "General Tech Skills";
        return (
          <Games 
            topic={topic} 
            userStats={stats} 
            onUpdateStats={(newStats) => {
                setStats(newStats);
                if (currentUser) updateUserStats(currentUser.email, newStats);
            }} 
          />
        );
      case 'jobs':
        return currentUser ? (
          <Jobs user={currentUser} roadmap={roadmap} />
        ) : null;
      case 'loading_roadmap':
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <div className="relative mb-8">
                     <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                     <Loader2 size={64} className="text-blue-400 animate-spin relative z-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Constructing Next Level...</h2>
                <p className="text-slate-400">Analyzing your progress and generating advanced milestones.</p>
            </div>
        );
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView} 
      onNavigate={setCurrentView}
      onLogout={handleLogout}
      onDeleteAccount={handleDeleteAccount}
      onOpenFeedback={() => setIsFeedbackOpen(true)}
    >
      <AnimatePresence mode="wait">
        {currentView === 'auth' && !isLoadingSession ? (
          <Auth onLogin={handleLogin} key="auth" />
        ) : (
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
      
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </Layout>
  );
}

export default App;