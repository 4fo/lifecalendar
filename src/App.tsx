import { useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import Header from './components/Header';
import LifeCalendar from './components/LifeCalendar';
import Timeline from './components/Timeline';
import Statistics from './components/Statistics';
import EventModal from './components/EventModal';
import SettingsModal from './components/SettingsModal';
import { Event, CATEGORIES } from './types';
import { Calendar, Clock, BarChart3, Plus, ChevronDown, ChevronUp, Trash2, Copy, Download, Upload } from 'lucide-react';

function AppContent() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'calendar' | 'timeline' | 'statistics'>('calendar');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [birthday, setBirthday] = useState(() => new Date(1990, 0, 1));
  const [showEventDetails, setShowEventDetails] = useState<Event | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      showToast('Event updated successfully', 'success');
    } else {
      dispatch({ type: 'ADD_EVENT', payload: event });
      showToast('Event added successfully', 'success');
    }
  };

  const handleDeleteEvent = (id: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: id });
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
    showToast('Events exported successfully', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const events = JSON.parse(e.target?.result as string);
          dispatch({ type: 'SET_EVENTS', payload: events });
          showToast('Events imported successfully', 'success');
        } catch {
          showToast('Invalid file format', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopyLink = (event: Event) => {
    navigator.clipboard.writeText(`${window.location.origin}/event/${event.id}`);
    showToast('Link copied to clipboard', 'success');
  };

  const handleWeekClick = (week: { year: number; weekNumber: number; start: Date; end: Date }) => {
    console.log('Week clicked:', week);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onSearchChange={query => dispatch({ type: 'SET_SEARCH_QUERY', payload: query })}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
      />

      <div className="flex">
        <nav className="fixed bottom-0 md:sticky top-16 left-0 w-full md:w-16 md:h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-700 z-30">
          <div className="flex md:flex-col justify-around md:justify-start md:pt-4 md:gap-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center gap-1 p-3 md:p-3 rounded-lg transition-colors ${activeTab === 'calendar' ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs md:hidden">Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex flex-col items-center gap-1 p-3 md:p-3 rounded-lg transition-colors ${activeTab === 'timeline' ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs md:hidden">Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex flex-col items-center gap-1 p-3 md:p-3 rounded-lg transition-colors ${activeTab === 'statistics' ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs md:hidden">Stats</span>
            </button>
          </div>
        </nav>

        <main className="flex-1 md:ml-16 p-4 pb-20 md:pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Birthday:</label>
                <input
                  type="date"
                  value={birthday.toISOString().split('T')[0]}
                  onChange={e => setBirthday(new Date(e.target.value))}
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
        </main>
      </div>

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
