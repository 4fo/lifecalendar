export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  category: Category;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Category = 'personal' | 'work' | 'health' | 'family' | 'education' | 'achievement' | 'milestone';

export interface CategoryConfig {
  id: Category;
  label: string;
  color: string;
  icon: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'personal', label: 'Personal', color: '#8b5cf6', icon: 'User' },
  { id: 'work', label: 'Work', color: '#f59e0b', icon: 'Briefcase' },
  { id: 'health', label: 'Health', color: '#10b981', icon: 'Heart' },
  { id: 'family', label: 'Family', color: '#ec4899', icon: 'Users' },
  { id: 'education', label: 'Education', color: '#3b82f6', icon: 'BookOpen' },
  { id: 'achievement', label: 'Achievement', color: '#eab308', icon: 'Trophy' },
  { id: 'milestone', label: 'Milestone', color: '#ef4444', icon: 'Flag' },
];

export interface UserSettings {
  weekStartDay: 'sunday' | 'monday';
  showPastYears: boolean;
  lifeSpan: number;
  theme: 'light' | 'dark' | 'system';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
}

export interface SyncState {
  lastSync: Date | null;
  pendingChanges: number;
  isSyncing: boolean;
}

export interface GuidedLifeData {
  yearlyGoals: string[];
  quarterlyObjectives: string[];
  monthlyMilestones: string[];
  weeklyTasks: string[];
  lastNudgeDate: Date | null;
  nudgeFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
}
