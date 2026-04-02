import { useState, useMemo } from 'react';
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
  
  const hideCompletedWeeks = externalHideCompleted ?? true;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const birthYear = birthday.getFullYear();
  const lifeSpan = state.settings.lifeSpan;
  const weekStartDay = state.settings.weekStartDay;
  const showPastYears = state.settings.showPastYears;
  
  const currentWeekNum = getCurrentWeekNumber(weekStartDay);

  const years = useMemo(() => {
    const maxYear = birthYear + lifeSpan;
    return Array.from({ length: lifeSpan }, (_, ageIndex) => birthYear + ageIndex).filter(year => {
      if (showOnlyCurrentYear) return year === currentYear;
      if (!showPastYears && year < currentYear) return false;
      return year <= maxYear; // Show full life span
    });
  }, [lifeSpan, birthYear, currentYear, showOnlyCurrentYear, showPastYears]);

  const batches = useMemo(() => {
    const result = [];
    for (let i = 0; i < years.length; i += 10) {
      result.push(years.slice(i, i + 10));
    }
    return result;
  }, [years]);

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
    if (weekEvents.length === 0) return 'bg-gray-200 dark:bg-gray-700';
    
    const primaryCategory = weekEvents[0].category;
    const categoryConfig = CATEGORIES.find(c => c.id === primaryCategory);
    return categoryConfig ? `${categoryConfig.color}40` : 'bg-gray-200 dark:bg-gray-700';
  };

  const toggleBatch = (index: number, setExpandedBatches: any, expandedBatches: Set<number>) => {
    const next = new Set(expandedBatches);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpandedBatches(next);
  };

  const WeekBlock = ({ year, weekNum }: { year: number; weekNum: number }) => {
    const isPast = isWeekPast(year, weekNum);
    const isCurrent = isCurrentWeek(year, weekNum);
    const weekEvents = getEventsForWeek(year, weekNum);
    const isHovered = hoveredWeek?.year === year && hoveredWeek?.weekNumber === weekNum;
    
    return (
      <div
        className={`
          flex-1 sm:aspect-square min-w-[3px]
          ${isPast && hideCompletedWeeks ? 'opacity-0' : 'opacity-100'}
          ${isPast ? 'bg-gray-200 dark:bg-gray-700' : getWeekColor(year, weekNum)}
          ${isCurrent ? 'ring-2 ring-red-500 ring-offset-0.5 animate-pulse' : ''}
          ${isHovered ? 'scale-110 z-10' : ''}
          cursor-pointer transition-transform rounded-sm
          h-4 sm:h-8 min-h-[20px]
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
  };

  if (showOnlyCurrentYear) {
    return (
      <div className="p-2">
        <div className="flex items-center gap-0">
          <div className="w-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium flex-shrink-0">
            {currentYear}
          </div>
          <div className="flex -ml-1 gap-2 sm:gap-1 flex-1">
            {Array.from({ length: 52 }, (_, weekIndex) => {
              const weekNum = weekIndex + 1;
              return <WeekBlock key={weekNum} year={currentYear} weekNum={weekNum} />;
            })}
          </div>
        </div>
      </div>
    );
  }

  const [expandedBatches, setExpandedBatches] = useState<Set<number>>(() => {
    // Expand all batches initially
    return new Set(batches.map((_, i) => i));
  });

  return (
    <div className="p-2 sm:p-4 space-y-2">
      {batches.map((batch, batchIndex) => {
        const isExpanded = expandedBatches.has(batchIndex);
        const firstYear = batch[0];
        const lastYear = batch[batch.length - 1];
        
        return (
          <div key={batchIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleBatch(batchIndex, setExpandedBatches, expandedBatches)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {firstYear} - {lastYear} ({lastYear - firstYear + 1} years)
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isExpanded && (
              <div className="p-2 space-y-1">
                {batch.map(year => (
                  <div key={year} className="flex items-center gap-0">
                    <div className="w-8 text-xs text-gray-500 dark:text-gray-400 font-medium flex-shrink-0">
                      {year}
                    </div>
                    <div className="flex -ml-1 gap-2 sm:gap-1 flex-1">
                      {Array.from({ length: 52 }, (_, weekIndex) => {
                        const weekNum = weekIndex + 1;
                        return <WeekBlock key={weekNum} year={year} weekNum={weekNum} />;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      <div className="flex items-center gap-4 text-xs px-2 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
          <span className="text-gray-500 dark:text-gray-400">Past</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm ring-2 ring-red-500 ring-offset-0.5" />
          <span className="text-gray-500 dark:text-gray-400">Current (Week {currentWeekNum})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary-500/40" />
          <span className="text-gray-500 dark:text-gray-400">Has Events</span>
        </div>
      </div>
    </div>
  );
}
