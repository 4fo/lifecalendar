import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Event, UserSettings, GuidedLifeData } from '../types';

interface AppState {
  events: Event[];
  settings: UserSettings;
  guidedLife: GuidedLifeData;
  searchQuery: string;
  selectedCategory: string | null;
  selectedDateRange: { start: Date | null; end: Date | null };
  isDarkMode: boolean;
}

type Action =
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SET_GUIDED_LIFE'; payload: Partial<GuidedLifeData> }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'SET_DATE_RANGE'; payload: { start: Date | null; end: Date | null } }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: AppState };

const initialSettings: UserSettings = {
  weekStartDay: 'sunday',
  showPastYears: false,
  lifeSpan: 71,
  theme: 'system',
  dateFormat: 'MM/DD/YYYY',
};

const initialGuidedLife: GuidedLifeData = {
  yearlyGoals: [],
  quarterlyObjectives: [],
  monthlyMilestones: [],
  weeklyTasks: [],
  lastNudgeDate: null,
  nudgeFrequency: 'weekly',
};

const initialState: AppState = {
  events: [],
  settings: initialSettings,
  guidedLife: initialGuidedLife,
  searchQuery: '',
  selectedCategory: null,
  selectedDateRange: { start: null, end: null },
  isDarkMode: false,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(e => e.id !== action.payload),
      };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_GUIDED_LIFE':
      return { ...state, guidedLife: { ...state.guidedLife, ...action.payload } };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, selectedDateRange: action.payload };
    case 'SET_DARK_MODE':
      return { ...state, isDarkMode: action.payload };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'lifecalendar_state';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.events = parsed.events.map((e: Event) => ({
          ...e,
          startDate: new Date(e.startDate),
          endDate: e.endDate ? new Date(e.endDate) : undefined,
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
        }));
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      dispatch({ type: 'SET_DARK_MODE', payload: true });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
