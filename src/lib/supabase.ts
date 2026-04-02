import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlkjwyqfxvbsvxscqngc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsa2p3eXFmeHZic3Z4c2NxbmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTUzODQsImV4cCI6MjA5MDY5MTM4NH0.hGXiorBLzUzKiuVSJgRX2mrMAn7clNs1dRXHfXfV2iY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SubscriptionTier = 'free' | 'premium';

export interface Profile {
  id: string;
  email: string;
  birthday: string | null;
  life_span: number;
  week_start_day: 'sunday' | 'monday';
  show_past_years: boolean;
  theme: 'light' | 'dark' | 'system';
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface DbEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  category: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface YearlyGoal {
  id: string;
  user_id: string;
  year: number;
  goals: string[];
  created_at: string;
}

export interface QuarterlyObjective {
  id: string;
  user_id: string;
  year: number;
  quarter: number;
  objectives: string[];
  created_at: string;
}

export interface MonthlyMilestone {
  id: string;
  user_id: string;
  year: number;
  month: number;
  milestones: string[];
  created_at: string;
}

export interface Nudge {
  id: string;
  user_id: string;
  nudge_type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  sent_at: string;
  completed: boolean;
}
