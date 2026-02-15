import { User, UserStats, Roadmap } from '../types';

const USERS_KEY = 'eduvoyager_users';
const SESSION_KEY = 'eduvoyager_session';

interface StoredUser {
  profile: User;
  password: string; // Stored in plain text for this demo (In production, use hashing!)
  stats: UserStats;
  currentRoadmap: Roadmap | null;
  roadmapHistory: Roadmap[];
}

// Helper to get the full DB object
const getDB = (): Record<string, StoredUser> => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : {};
};

// Helper to save the full DB object
const saveDB = (db: Record<string, StoredUser>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(db));
};

export const registerUser = (user: User, password: string): boolean => {
  const db = getDB();
  if (db[user.email]) {
    return false; // User already exists
  }
  
  db[user.email] = {
    profile: user,
    password: password,
    stats: {
        xp: 0,
        streak: 0,
        completedModules: 0,
        currentNsqfLevel: 0,
        badges: []
    },
    currentRoadmap: null,
    roadmapHistory: []
  };
  
  saveDB(db);
  localStorage.setItem(SESSION_KEY, user.email);
  return true;
};

export const loginUser = (email: string, password: string): User | null => {
  const db = getDB();
  const user = db[email];
  if (user && user.password === password) {
    localStorage.setItem(SESSION_KEY, email);
    return user.profile;
  }
  return null;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const deleteUser = (email: string) => {
  const db = getDB();
  if (db[email]) {
    delete db[email];
    saveDB(db);
  }
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentSession = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

export const getUserData = (email: string) => {
  const db = getDB();
  return db[email] || null;
};

export const updateUserRoadmap = (email: string, roadmap: Roadmap) => {
  const db = getDB();
  if (db[email]) {
    db[email].currentRoadmap = roadmap;
    saveDB(db);
  }
};

export const updateUserStats = (email: string, stats: UserStats) => {
  const db = getDB();
  if (db[email]) {
    db[email].stats = stats;
    saveDB(db);
  }
};

export const updateUserHistory = (email: string, history: Roadmap[]) => {
    const db = getDB();
    if (db[email]) {
        db[email].roadmapHistory = history;
        saveDB(db);
    }
};