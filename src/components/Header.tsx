import { useApp } from '../store/AppContext';
import { Moon, Sun, Search, Settings } from 'lucide-react';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  onSettingsClick: () => void;
}

export default function Header({ onSearchChange, onSettingsClick }: HeaderProps) {
  const { state, dispatch } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">LC</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Life Calendar</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track your journey</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={state.searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 rounded-lg bg-gray-100 dark:bg-gray-800 border-0 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={() => dispatch({ type: 'SET_DARK_MODE', payload: !state.isDarkMode })}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={state.isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {state.isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
