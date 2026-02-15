export interface User {
  firstName: string;
  lastName: string;
  designation: string;
  educationStage: 'discovery' | 'direction' | 'commitment' | 'progression'; // New taxonomy
  age: number;
  email: string;
}

export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'book';
  isPaid: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface SoftSkill {
  name: string;
  description: string;
  resources: Resource[];
}

export interface AssessmentQuestion {
  question: string;
  options: string[];
  allowMultiple?: boolean; // New field to enable checkboxes
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  nsqfLevel: number; // 1-10
  estimatedHours: number;
  resources: Resource[];
  completed: boolean;
}

export interface Roadmap {
  title: string;
  description: string;
  targetNsqfLevel: number;
  domain: string; // New
  learningObjectives: string[]; // New
  softSkills: SoftSkill[]; // Updated: List of required soft skills with resources
  decisionPrompts: string[]; // New
  steps: RoadmapStep[];
}

export interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Remote';
  salaryRange: string;
  platform: 'LinkedIn' | 'Indeed' | 'Glassdoor' | 'Naukri';
  url: string;
  matchScore: number; // 0-100
  skills: string[];
}

export type ViewState = 'auth' | 'assessment' | 'loading_roadmap' | 'dashboard' | 'roadmap' | 'games' | 'jobs';

export interface UserStats {
  xp: number;
  streak: number;
  completedModules: number;
  currentNsqfLevel: number;
  badges: string[]; // Array of Badge IDs
}

export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  type: 'core' | 'bonus';
}

export interface DailyPlan {
  date: string;
  tasks: Task[];
  isDayComplete: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name mapping
  condition: (stats: UserStats) => boolean;
  xpBonus: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  designation: string;
  xp: number;
  badgesCount: number;
  isCurrentUser: boolean;
  avatarColor: string;
}