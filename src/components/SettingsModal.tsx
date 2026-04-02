import { useApp } from '../store/AppContext';
import { X, Moon, Sun, Monitor } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, dispatch } = useApp();
  const { settings } = state;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Life Span (years)
            </label>
            <input
              type="number"
              value={settings.lifeSpan}
              onChange={e => dispatch({ type: 'SET_SETTINGS', payload: { lifeSpan: parseInt(e.target.value) || 71 } })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              min={1}
              max={120}
            />
            <p className="text-xs text-gray-500 mt-1">Default is 71 years (average lifespan)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Week Starts On
            </label>
            <select
              value={settings.weekStartDay}
              onChange={e => dispatch({ type: 'SET_SETTINGS', payload: { weekStartDay: e.target.value as 'sunday' | 'monday' } })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Show Past Years
            </label>
            <button
              onClick={() => dispatch({ type: 'SET_SETTINGS', payload: { showPastYears: !settings.showPastYears } })}
              className={`
                w-full px-4 py-2 rounded-lg border transition-colors
                ${settings.showPastYears 
                  ? 'bg-primary-500 border-primary-500 text-white' 
                  : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'}
              `}
            >
              {settings.showPastYears ? 'Enabled' : 'Disabled'}
            </button>
            <p className="text-xs text-gray-500 mt-1">When disabled, past weeks are hidden in the calendar</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch({ type: 'SET_SETTINGS', payload: { theme: 'light' } })}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors
                  ${settings.theme === 'light' 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
                `}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_SETTINGS', payload: { theme: 'dark' } })}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors
                  ${settings.theme === 'dark' 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
                `}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_SETTINGS', payload: { theme: 'system' } })}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors
                  ${settings.theme === 'system' 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
                `}
              >
                <Monitor className="w-4 h-4" />
                System
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={e => dispatch({ type: 'SET_SETTINGS', payload: { dateFormat: e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' } })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
