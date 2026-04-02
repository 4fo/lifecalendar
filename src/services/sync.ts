import { supabase, Profile } from '../lib/supabase';
import { Event } from '../types';

const LAST_SYNC_KEY = 'lifecalendar_last_sync';
const PENDING_SYNC_KEY = 'lifecalendar_pending_sync';

export interface SyncStatus {
  lastSync: Date | null;
  pendingChanges: number;
  isSyncing: boolean;
  error: string | null;
}

export function getLastSyncDate(): Date | null {
  const date = localStorage.getItem(LAST_SYNC_KEY);
  return date ? new Date(date) : null;
}

export function setLastSyncDate(date: Date) {
  localStorage.setItem(LAST_SYNC_KEY, date.toISOString());
}

export function getPendingSyncCount(): number {
  const count = localStorage.getItem(PENDING_SYNC_KEY);
  return count ? parseInt(count, 10) : 0;
}

export function incrementPendingSync() {
  const count = getPendingSyncCount();
  localStorage.setItem(PENDING_SYNC_KEY, (count + 1).toString());
}

export function clearPendingSync() {
  localStorage.setItem(PENDING_SYNC_KEY, '0');
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  return data;
}

export async function fetchEvents(userId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true });
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return (data || []).map(dbEvent => ({
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description || undefined,
    startDate: new Date(dbEvent.start_date),
    endDate: dbEvent.end_date ? new Date(dbEvent.end_date) : undefined,
    category: dbEvent.category as Event['category'],
    color: dbEvent.color || undefined,
    createdAt: new Date(dbEvent.created_at),
    updatedAt: new Date(dbEvent.updated_at),
  }));
}

export async function syncEventToCloud(event: Event, userId: string) {
  const dbEvent = {
    id: event.id,
    user_id: userId,
    title: event.title,
    description: event.description,
    start_date: event.startDate.toISOString().split('T')[0],
    end_date: event.endDate?.toISOString().split('T')[0] || null,
    category: event.category,
    color: event.color,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('events')
    .upsert(dbEvent, { onConflict: 'id' })
    .select()
    .single();
  
  if (error) {
    console.error('Error syncing event:', error);
    throw error;
  }
  return data;
}

export async function deleteEventFromCloud(eventId: string, userId: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error deleting event from cloud:', error);
    throw error;
  }
}

export async function syncAllEvents(events: Event[], userId: string): Promise<boolean> {
  try {
    for (const event of events) {
      await syncEventToCloud(event, userId);
    }
    setLastSyncDate(new Date());
    clearPendingSync();
    return true;
  } catch (error) {
    console.error('Error syncing all events:', error);
    return false;
  }
}

export async function fetchYearlyGoals(userId: string, year: number): Promise<string[]> {
  const { data, error } = await supabase
    .from('yearly_goals')
    .select('goals')
    .eq('user_id', userId)
    .eq('year', year)
    .single();
  
  if (error) return [];
  return data?.goals || [];
}

export async function saveYearlyGoals(userId: string, year: number, goals: string[]) {
  const { data, error } = await supabase
    .from('yearly_goals')
    .upsert({
      id: `${userId}_${year}`,
      user_id: userId,
      year,
      goals,
    }, { onConflict: 'id' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function fetchQuarterlyObjectives(userId: string, year: number, quarter: number): Promise<string[]> {
  const { data, error } = await supabase
    .from('quarterly_objectives')
    .select('objectives')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('quarter', quarter)
    .single();
  
  if (error) return [];
  return data?.objectives || [];
}

export async function saveQuarterlyObjectives(userId: string, year: number, quarter: number, objectives: string[]) {
  const { data, error } = await supabase
    .from('quarterly_objectives')
    .upsert({
      id: `${userId}_${year}_Q${quarter}`,
      user_id: userId,
      year,
      quarter,
      objectives,
    }, { onConflict: 'id' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function fetchMonthlyMilestones(userId: string, year: number, month: number): Promise<string[]> {
  const { data, error } = await supabase
    .from('monthly_milestones')
    .select('milestones')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)
    .single();
  
  if (error) return [];
  return data?.milestones || [];
}

export async function saveMonthlyMilestones(userId: string, year: number, month: number, milestones: string[]) {
  const { data, error } = await supabase
    .from('monthly_milestones')
    .upsert({
      id: `${userId}_${year}_M${month}`,
      user_id: userId,
      year,
      month,
      milestones,
    }, { onConflict: 'id' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function fetchAllGuidedLifeData(userId: string) {
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const currentMonth = new Date().getMonth() + 1;

  const [yearlyGoals, quarterlyObjectives, monthlyMilestones] = await Promise.all([
    fetchYearlyGoals(userId, currentYear),
    fetchQuarterlyObjectives(userId, currentYear, currentQuarter),
    fetchMonthlyMilestones(userId, currentYear, currentMonth),
  ]);

  return {
    yearlyGoals,
    quarterlyObjectives,
    monthlyMilestones,
  };
}

export async function performDailySync(events: Event[], userId: string): Promise<SyncStatus> {
  const syncStatus: SyncStatus = {
    lastSync: getLastSyncDate(),
    pendingChanges: getPendingSyncCount(),
    isSyncing: true,
    error: null,
  };

  try {
    const success = await syncAllEvents(events, userId);
    if (success) {
      syncStatus.lastSync = new Date();
      syncStatus.pendingChanges = 0;
    } else {
      syncStatus.error = 'Failed to sync events';
    }
  } catch (error) {
    syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
  }

  syncStatus.isSyncing = false;
  return syncStatus;
}
