import { Badge, LeaderboardEntry, UserStats, User } from '../types';

export const BADGES: Badge[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first learning module.',
    icon: 'Footprints',
    xpBonus: 50,
    condition: (stats) => stats.completedModules >= 1
  },
  {
    id: 'streak_week',
    name: 'On Fire',
    description: 'Maintain a 3-day learning streak.',
    icon: 'Flame',
    xpBonus: 100,
    condition: (stats) => stats.streak >= 3
  },
  {
    id: 'xp_hunter',
    name: 'XP Hunter',
    description: 'Earn 500 total XP.',
    icon: 'Target',
    xpBonus: 200,
    condition: (stats) => stats.xp >= 500
  },
  {
    id: 'scholar',
    name: 'The Scholar',
    description: 'Reach NSQF Level 5.',
    icon: 'GraduationCap',
    xpBonus: 300,
    condition: (stats) => stats.currentNsqfLevel >= 5
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 5 modules.',
    icon: 'BookOpen',
    xpBonus: 150,
    condition: (stats) => stats.completedModules >= 5
  },
  {
    id: 'elite',
    name: 'Elite Learner',
    description: 'Reach 1000 XP.',
    icon: 'Crown',
    xpBonus: 500,
    condition: (stats) => stats.xp >= 1000
  }
];

export const checkForNewBadges = (currentStats: UserStats): Badge[] => {
  const earnedBadges: Badge[] = [];
  
  BADGES.forEach(badge => {
    // If user doesn't have the badge yet AND meets the condition
    if (!currentStats.badges.includes(badge.id) && badge.condition(currentStats)) {
      earnedBadges.push(badge);
    }
  });

  return earnedBadges;
};

export const getLeaderboardData = (currentUser: User, currentStats: UserStats): LeaderboardEntry[] => {
  // Generate mock data around the user's score to make it competitive
  const baseXP = currentStats.xp;
  
  const mockUsers = [
    { name: "Sarah J.", designation: "Data Scientist", xp: baseXP + 450, badges: 8, color: "bg-pink-500" },
    { name: "Mike T.", designation: "Frontend Dev", xp: baseXP + 210, badges: 5, color: "bg-blue-500" },
    { name: "Davide R.", designation: "Student", xp: baseXP + 50, badges: 3, color: "bg-green-500" },
    { name: "Elena V.", designation: "Product Manager", xp: Math.max(0, baseXP - 120), badges: 2, color: "bg-purple-500" },
    { name: "Raj P.", designation: "Engineer", xp: Math.max(0, baseXP - 300), badges: 1, color: "bg-orange-500" },
  ];

  const entries: LeaderboardEntry[] = mockUsers.map((u, i) => ({
    rank: 0, // Assigned later
    name: u.name,
    designation: u.designation,
    xp: u.xp,
    badgesCount: u.badges,
    isCurrentUser: false,
    avatarColor: u.color
  }));

  // Add current user
  entries.push({
    rank: 0,
    name: `${currentUser.firstName} ${currentUser.lastName.charAt(0)}.`,
    designation: currentUser.designation,
    xp: currentStats.xp,
    badgesCount: currentStats.badges.length,
    isCurrentUser: true,
    avatarColor: "bg-blue-600"
  });

  // Sort by XP
  entries.sort((a, b) => b.xp - a.xp);

  // Assign ranks
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
};