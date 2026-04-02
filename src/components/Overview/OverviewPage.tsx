import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import Statistics from '../Statistics';
import GuidedLifePanel from '../GuidedLife/GuidedLifePanel';
import LifeCalendar from '../LifeCalendar';
import { Event, CATEGORIES } from '../../types';
import { Calendar, Clock, BarChart3, Target, ChevronDown, ChevronUp, Plus, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { formatDate, getCurrentWeekNumber, isWithinInterval, getWeekRange } from '../../utils/dateUtils';

interface OverviewPageProps {
  birthday: Date;
  events: Event[];
  onNavigate: (tab: 'calendar' | 'timeline' | 'statistics' | 'guided') => void;
  onAddEvent: () => void;
  onEditEvent: (event: Event) => void;
}

export default function OverviewPage({ birthday, events, onNavigate, onAddEvent, onEditEvent }: OverviewPageProps) {
  const { state } = useApp();
  const [expandedSection, setExpandedSection] = useState<string | null>('all');
  const [hideCompletedWeeks, setHideCompletedWeeks] = useState(true);

  const currentYear = new Date().getFullYear();
  const weekStartDay = state.settings.weekStartDay;
  const currentWeekNum = getCurrentWeekNumber(weekStartDay);
  const { start: weekStart, end: weekEnd } = getWeekRange(currentWeekNum, currentYear, weekStartDay);

  const thisWeekEvents = events.filter(event => 
    isWithinInterval(event.startDate, { start: weekStart, end: weekEnd }) ||
    (event.endDate && isWithinInterval(event.endDate, { start: weekStart, end: weekEnd }))
  ).slice(0, 5);

  const sections = [
    {
      id: 'stats',
      title: 'Life Statistics',
      icon: BarChart3,
      component: <div className="p-2 sm:p-4"><Statistics birthday={birthday} /></div>,
      shortDescription: 'Your life progress at a glance',
    },
    {
      id: 'guided',
      title: 'Guided Life',
      icon: Target,
      component: <div className="p-2 sm:p-4"><GuidedLifePanel userId={null} isPremium={false} /></div>,
      shortDescription: 'Yearly goals, objectives & milestones',
    },
    {
      id: 'calendar',
      title: 'This Year',
      icon: Calendar,
      component: (
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Week {currentWeekNum} of {currentYear}
            </span>
            <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={hideCompletedWeeks}
                onChange={e => setHideCompletedWeeks(e.target.checked)}
                className="rounded w-3 h-3"
              />
              {hideCompletedWeeks ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span className="hidden sm:inline">{hideCompletedWeeks ? 'Hide past' : 'Show all'}</span>
            </label>
          </div>
          <LifeCalendar 
            birthday={birthday} 
            events={events} 
            onWeekClick={() => {}}
            showOnlyCurrentYear={true}
            hideCompletedWeeks={hideCompletedWeeks}
          />
        </div>
      ),
      shortDescription: `Week ${currentWeekNum} • ${thisWeekEvents.length} events this week`,
    },
    {
      id: 'timeline',
      title: 'This Week',
      icon: Clock,
      component: (
        <div className="p-2 sm:p-4">
          {thisWeekEvents.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p className="text-sm mb-1">No events this week</p>
              <p className="text-xs">{formatDate(weekStart, 'MMM d')} - {formatDate(weekEnd, 'MMM d, yyyy')}</p>
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-2">
              {thisWeekEvents.map(event => {
                const categoryConfig = CATEGORIES.find(c => c.id === event.category);
                return (
                  <div
                    key={event.id}
                    onClick={() => onEditEvent(event)}
                    className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: categoryConfig?.color || '#64748b' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(event.startDate, 'MMM d')}
                        {event.endDate && ` - ${formatDate(event.endDate, 'MMM d')}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button
            onClick={onAddEvent}
            className="w-full mt-2 sm:mt-3 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Event This Week</span>
            <span className="sm:hidden">Add Event</span>
          </button>
        </div>
      ),
      shortDescription: `${thisWeekEvents.length} events this week`,
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="space-y-4 pb-24 md:pb-4">
      {sections.map(section => {
        const isExpanded = expandedSection === section.id || expandedSection === 'all';
        const Icon = section.icon;

        return (
          <div 
            key={section.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-500" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{section.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{section.shortDescription}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(section.id as any);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs sm:text-sm text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  <span className="hidden sm:inline">Expand</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </button>
            
            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                {section.component}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
