import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { getWeekRange, getCurrentWeekNumber, isWithinInterval } from '../utils/dateUtils';
import { Event, CATEGORIES } from '../types';

interface LifeCalendarProps {
  birthday: Date;
  events: Event[];
  onWeekClick?: (week: { year: number; weekNumber: number; start: Date; end: Date }) => void;
}

export default function LifeCalendar({ birthday, events, onWeekClick }: LifeCalendarProps) {
  const { state } = useApp();
  const [hoveredWeek, setHoveredWeek] = useState<{ year: number; weekNumber: number } | null>(null);
  
  const currentYear = new Date().getFullYear();
  const birthYear = birthday.getFullYear();
  const lifeSpan = state.settings.lifeSpan;
  const weekStartDay = state.settings.weekStartDay;
  const showPastYears = state.settings.showPastYears;
  const currentWeekNum = getCurrentWeekNumber(weekStartDay);

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
    return categoryConfig ? `${categoryConfig.color}20` : 'bg-gray-100 dark:bg-gray-800';
  };

  return (
    <div className="overflow-auto max-h-[600px] p-4">
      <div className="flex flex-col gap-1">
        {Array.from({ length: lifeSpan }, (_, ageIndex) => {
          const year = birthYear + ageIndex;
          if (year > currentYear + 10) return null;
          
          if (!showPastYears && year < currentYear) return null;

          return (
            <div key={year} className="flex items-center gap-2">
              <div className="w-16 text-sm text-gray-500 dark:text-gray-400 font-medium">
                {year}
                <span className="text-xs ml-1">({ageIndex})</span>
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
                        week-block w-3 h-3 rounded-sm cursor-pointer
                        ${isPast && !showPastYears ? 'opacity-0' : 'opacity-100'}
                        ${isPast ? 'bg-gray-200 dark:bg-gray-700' : getWeekColor(year, weekNum)}
                        ${isCurrent ? 'ring-2 ring-red-500 ring-offset-1' : ''}
                        ${isHovered ? 'scale-125 z-10' : ''}
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
          );
        })}
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
          <span className="text-gray-600 dark:text-gray-400">Past</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm ring-2 ring-red-500 ring-offset-1" />
          <span className="text-gray-600 dark:text-gray-400">Current Week</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary-500/20" />
          <span className="text-gray-600 dark:text-gray-400">Has Events</span>
        </div>
      </div>
    </div>
  );
}
