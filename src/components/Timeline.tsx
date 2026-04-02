import { useRef } from 'react';
import { formatDate } from '../utils/dateUtils';
import { Event, CATEGORIES } from '../types';

interface TimelineProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export default function Timeline({ events, onEventClick }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sortedEvents = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const groupedByYear = sortedEvents.reduce((acc, event) => {
    const year = event.startDate.getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {} as Record<number, Event[]>);

  const years = Object.keys(groupedByYear).map(Number).sort((a, b) => a - b);

  return (
    <div className="relative" ref={containerRef}>
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-primary-400 to-gray-300 dark:from-primary-600 dark:via-primary-500 dark:to-gray-700" />
      
      <div className="space-y-8 p-4">
        {years.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">No events yet</p>
            <p className="text-sm">Add your first life event to see it on the timeline</p>
          </div>
        ) : (
          years.map(year => (
            <div key={year} className="relative">
              <div className="absolute left-6 top-4 w-5 h-5 rounded-full bg-primary-500 border-4 border-white dark:border-gray-900 z-10" />
              <div className="ml-12 pt-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{year}</h3>
                <div className="space-y-3">
                  {groupedByYear[year].map(event => {
                    const categoryConfig = CATEGORIES.find(c => c.id === event.category);
                    return (
                      <div
                        key={event.id}
                        className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600"
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ backgroundColor: categoryConfig?.color || '#64748b' }} />
                        <div className="ml-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h4>
                            <span 
                              className="text-xs px-2 py-1 rounded-full text-white"
                              style={{ backgroundColor: categoryConfig?.color || '#64748b' }}
                            >
                              {categoryConfig?.label || event.category}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatDate(event.startDate, 'MMM dd')}</span>
                            {event.endDate && (
                              <span>→ {formatDate(event.endDate, 'MMM dd')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
