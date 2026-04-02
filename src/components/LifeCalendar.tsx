import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { getWeekRange, getCurrentWeekNumber, isWithinInterval } from '../utils/dateUtils';
import { Event, CATEGORIES } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface LifeCalendarProps {
  birthday: Date;
  events: Event[];
  onWeekClick?: (week: { year: number; weekNumber: number; start: Date; end: Date }) => void;
  showOnlyCurrentYear?: boolean;
  hideCompletedWeeks?: boolean;
}

export default function LifeCalendar({ birthday, events, onWeekClick, showOnlyCurrentYear = false, hideCompletedWeeks: externalHideCompleted }: LifeCalendarProps) {
  const { state } = useApp();
  const [hoveredWeek, setHoveredWeek] = useState<{ year: number; weekNumber: number } | null>(null);
  const [expandedBatches, setExpandedBatches] = useState<Set<number>>(new Set([0]));
  
  const hideCompletedWeeks = externalHideCompleted ?? true;
  
  const currentYear = new Date().getFullYear();
  const birthYear = birthday.getFullYear();
  const lifeSpan = state.settings.lifeSpan;
  const weekStartDay = state.settings.weekStartDay;
  const showPastYears = state.settings.showPastYears;
  const currentWeekNum = getCurrentWeekNumber(weekStartDay);

  const years = Array.from({ length: lifeSpan }, (_, ageIndex) => birthYear + ageIndex).filter(year => {
    if (showOnlyCurrentYear) return year === currentYear;
    if (!showPastYears && year < currentYear) return false;
    return year <= currentYear + 20;
  });

  const batches = [];
  for (let i = 0; i < years.length; i += 10) {
    batches.push(years.slice(i, i + 10));
  }

  const getEventsForWeek = (year: number, weekNum: number) => {
    const { start, end } = getWeekRange(weekNum, year, weekStartDay);
    return events.filter(event => 
      isWithinInterval(event.startDate, { start, end }) ||
      (event.endDate && isWithinInterval(event.endDate, { start, end }))
    );
  };

  const isWeekPast = (year: number, weekNum: number) => {
    if (year > currentYear) return false;
    if (year < currentYear) return true;
    return weekNum < currentWeekNum;
  };

  const isCurrentWeek = (year: number, weekNum: number) => {
    return year === currentYear && weekNum === currentWeekNum;
  };

  const getWeekColor = (year: number, weekNum: number) => {
    const weekEvents = getEventsForWeek(year, weekNum);
    if (weekEvents.length === 0) return 'bg-gray-100 dark:bg-gray-800';
    
    const primaryCategory = weekEvents[0].category;
    const categoryConfig = CATEGORIES.find(c => c.id === primaryCategory);
    return categoryConfig ? `${categoryConfig.color}30` : 'bg-gray-100 dark:bg-gray-800';
  };

  const toggleBatch = (index: number) => {
    setExpandedBatches(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="overflow-auto max-h-[600px]">
      <div className="p-4 space-y-4">
        {batches.map((batch, batchIndex) => {
          const isExpanded = expandedBatches.has(batchIndex);
          const firstYear = batch[0];
          const lastYear = batch[batch.length - 1];
          
          return (
            <div key={batchIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleBatch(batchIndex)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {firstYear} - {lastYear} ({lastYear - firstYear + 1} years)
                </span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {isExpanded && (
                <div className="p-2">
                  <div className="flex flex-col gap-0.5">
                    {batch.map(year => (
                      <div key={year} className="flex items-center gap-2">
                        <div className="w-12 text-xs text-gray-500 dark:text-gray-400 font-medium flex-shrink-0">
                          {year}
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                          {Array.from({ length: 52 }, (_, weekIndex) => {
                            const weekNum = weekIndex + 1;
                            const isPast = isWeekPast(year, weekNum);
                            const isCurrent = isCurrentWeek(year, weekNum);
                            const weekEvents = getEventsForWeek(year, weekNum);
                            const isHovered = hoveredWeek?.year === year && hoveredWeek?.weekNumber === weekNum;

                            return (
                              <div
                                key={weekNum}
                                className={`
                                  week-block w-2.5 h-2.5 rounded-sm cursor-pointer
                                  ${isPast && hideCompletedWeeks ? 'opacity-0' : 'opacity-100'}
                                  ${isPast ? 'bg-gray-200 dark:bg-gray-700' : getWeekColor(year, weekNum)}
                                  ${isCurrent ? 'animate-pulse ring-2 ring-red-500 ring-offset-1' : ''}
                                  ${isHovered ? 'scale-150 z-10' : ''}
                                `}
                                onMouseEnter={() => setHoveredWeek({ year, weekNumber: weekNum })}
                                onMouseLeave={() => setHoveredWeek(null)}
                                onClick={() => {
                                  const { start, end } = getWeekRange(weekNum, year, weekStartDay);
                                  onWeekClick?.({ year, weekNumber: weekNum, start, end });
                                }}
                                title={`Week ${weekNum}, ${year}${weekEvents.length > 0 ? ` (${weekEvents.length} events)` : ''}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {!showOnlyCurrentYear && (
        <div className="px-4 pb-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-700" />
            <span className="text-gray-500 dark:text-gray-400">Past</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm animate-pulse ring-2 ring-red-500 ring-offset-0.5" />
            <span className="text-gray-500 dark:text-gray-400">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary-500/30" />
            <span className="text-gray-500 dark:text-gray-400">Has Events</span>
          </div>
        </div>
      )}
    </div>
  );
}
