import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import Header from './components/Header';
import LifeCalendar from './components/LifeCalendar';
import Timeline from './components/Timeline';
import Statistics from './components/Statistics';
import EventModal from './components/EventModal';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import GuidedLifePanel from './components/GuidedLife/GuidedLifePanel';
import OverviewPage from './components/Overview/OverviewPage';
import { Event, CATEGORIES } from './types';
import { Calendar, Clock, BarChart3, Plus, ChevronDown, ChevronUp, Trash2, Copy, Download, Upload, Target, Home } from 'lucide-react';
import { getCurrentUser, signOut } from './services/auth';
import { getLastSyncDate, getPendingSyncCount, performDailySync, fetchEvents, fetchProfile, updateProfile, incrementPendingSync, SyncStatus } from './services/sync';
import { User as SupabaseUser } from '@supabase/supabase-js';

function AppContent() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'timeline' | 'statistics' | 'guided'>('overview');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [birthday, setBirthday] = useState(() => new Date(1990, 0, 1));
  const [showEventDetails, setShowEventDetails] = useState<Event | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Auth & Sync state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    pendingChanges: 0,
    isSyncing: false,
    error: null,
  });

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      loadCloudData(currentUser.id);
    } else {
      const lastSync = getLastSyncDate();
      const pending = getPendingSyncCount();
      setSyncStatus({ lastSync, pendingChanges: pending, isSyncing: false, error: null });
    }
  };

  const loadCloudData = async (userId: string) => {
    try {
      const [profile, events] = await Promise.all([
        fetchProfile(userId),
        fetchEvents(userId),
      ]);
      
      if (profile) {
        if (profile.birthday) {
          setBirthday(new Date(profile.birthday));
        }
        dispatch({ type: 'SET_SETTINGS', payload: {
          lifeSpan: profile.life_span,
          weekStartDay: profile.week_start_day as 'sunday' | 'monday',
          showPastYears: profile.show_past_years,
          theme: profile.theme as 'light' | 'dark' | 'system',
        }});
      }
      
      if (events.length > 0) {
        dispatch({ type: 'SET_EVENTS', payload: events });
      }
      
      setSyncStatus({
        lastSync: getLastSyncDate(),
        pendingChanges: getPendingSyncCount(),
        isSyncing: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading cloud data:', error);
    }
  };

  const handleAuthSuccess = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      loadCloudData(currentUser.id);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    showToast('Signed out successfully', 'success');
  };

  const handleDailySync = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    const result = await performDailySync(state.events, user.id);
    setSyncStatus({
      ...result,
      isSyncing: false,
    });
    
    if (!result.error) {
      showToast('Synced successfully', 'success');
    } else {
      showToast(result.error, 'error');
    }
  };

  const filteredEvents = state.events.filter(event => {
    const matchesSearch = !state.searchQuery || 
      event.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesCategory = !state.selectedCategory || event.category === state.selectedCategory;
    const matchesDateRange = (!state.selectedDateRange.start || event.startDate >= state.selectedDateRange.start) &&
      (!state.selectedDateRange.end || event.startDate <= state.selectedDateRange.end);
    return matchesSearch && matchesCategory && matchesDateRange;
  });

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (event: Event) => {
    if (editingEvent) {
      dispatch({ type: 'UPDATE_EVENT', payload: event });
    } else {
      dispatch({ type: 'ADD_EVENT', payload: event });
    }
    
    if (user) {
      incrementPendingSync();
      setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
    }
    
    showToast(editingEvent ? 'Event updated' : 'Event added', 'success');
  };

  const handleDeleteEvent = (id: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: id });
    if (user) {
      incrementPendingSync();
    }
    showToast('Event deleted', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    const data = JSON.stringify(state.events, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lifecalendar-export.json';
    a.click();
    showToast('Events exported', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const events = JSON.parse(e.target?.result as string);
          dispatch({ type: 'SET_EVENTS', payload: events });
          showToast('Events imported', 'success');
        } catch {
          showToast('Invalid file format', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopyLink = (event: Event) => {
    navigator.clipboard.writeText(`${window.location.origin}/event/${event.id}`);
    showToast('Link copied', 'success');
  };

  const handleWeekClick = (week: { year: number; weekNumber: number; start: Date; end: Date }) => {
    console.log('Week clicked:', week);
  };

  const tabs = [
    { id: 'overview', icon: Home, label: 'Overview', description: 'Your life at a glance with stats, guided life, calendar, and events' },
    { id: 'calendar', icon: Calendar, label: 'Calendar', description: 'Full life calendar view with weekly blocks from birth to life expectancy' },
    { id: 'timeline', icon: Clock, label: 'Timeline', description: 'Chronological timeline of your life events grouped by year' },
    { id: 'statistics', icon: BarChart3, label: 'Stats', description: 'Life statistics, progress tracking, and event analytics' },
    { id: 'guided', icon: Target, label: 'Guided Life', description: 'Set yearly goals, quarterly objectives, and monthly milestones' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onSearchChange={query => dispatch({ type: 'SET_SEARCH_QUERY', payload: query })}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        user={user}
        onAuthClick={() => user ? handleSignOut() : setIsAuthModalOpen(true)}
        syncStatus={syncStatus}
        onSyncClick={handleDailySync}
      />

      <div className="pb-20 md:pb-4">
        <main className="md:ml-16 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Birthday:</label>
                <input
                  type="date"
                  value={birthday.toISOString().split('T')[0]}
                  onChange={async e => {
                    const newBirthday = new Date(e.target.value);
                    setBirthday(newBirthday);
                    if (user) {
                      await updateProfile(user.id, { birthday: e.target.value });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                title="Export"
              >
                <Download className="w-4 h-4" />
              </button>
              <label className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" title="Import">
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              <button
                onClick={handleAddEvent}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Category</label>
                  <select
                    value={state.selectedCategory || ''}
                    onChange={e => dispatch({ type: 'SET_SELECTED_CATEGORY', payload: e.target.value || null })}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 text-sm"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">From Date</label>
                  <input
                    type="date"
                    value={state.selectedDateRange.start?.toISOString().split('T')[0] || ''}
                    onChange={e => dispatch({ type: 'SET_DATE_RANGE', payload: { ...state.selectedDateRange, start: e.target.value ? new Date(e.target.value) : null } })}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">To Date</label>
                  <input
                    type="date"
                    value={state.selectedDateRange.end?.toISOString().split('T')[0] || ''}
                    onChange={e => dispatch({ type: 'SET_DATE_RANGE', payload: { ...state.selectedDateRange, end: e.target.value ? new Date(e.target.value) : null } })}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <OverviewPage 
              birthday={birthday} 
              events={filteredEvents}
              onNavigate={setActiveTab}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
            />
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <LifeCalendar birthday={birthday} events={filteredEvents} onWeekClick={handleWeekClick} />
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Timeline events={filteredEvents} onEventClick={handleEditEvent} />
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Statistics birthday={birthday} />
            </div>
          )}

          {activeTab === 'guided' && (
            <GuidedLifePanel userId={user?.id || null} isPremium={false} />
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 md:sticky md:top-16 md:left-0 md:w-16 md:h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-700 z-30">
        <div className="flex md:flex-col justify-around md:justify-start md:pt-4 md:gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex flex-col items-center gap-1 p-3 md:p-3 rounded-lg transition-colors ${activeTab === tab.id ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title={tab.description}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs md:hidden">{tab.label}</span>
              <div className="hidden md:block absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                <div className="font-medium">{tab.label}</div>
                <div className="text-gray-300 dark:text-gray-400 font-normal">{tab.description}</div>
                <div className="absolute left-0 -ml-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
              </div>
            </button>
          ))}
        </div>
      </nav>

      <EventModal
        event={editingEvent}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {showEventDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEventDetails(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{showEventDetails.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleCopyLink(showEventDetails)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Copy link">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => { handleEditEvent(showEventDetails); setShowEventDetails(null); }} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit">
                  <Calendar className="w-4 h-4" />
                </button>
                <button onClick={() => { handleDeleteEvent(showEventDetails.id); setShowEventDetails(null); }} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {showEventDetails.description && <p className="text-gray-600 dark:text-gray-400 mb-4">{showEventDetails.description}</p>}
            <button onClick={() => setShowEventDetails(null)} className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Close</button>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
