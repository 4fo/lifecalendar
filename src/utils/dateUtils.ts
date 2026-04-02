import { format, differenceInYears, differenceInWeeks, startOfWeek, endOfWeek, eachWeekOfInterval, eachYearOfInterval, addWeeks, isWithinInterval } from 'date-fns';

export { format, differenceInYears, differenceInWeeks, startOfWeek, endOfWeek, eachWeekOfInterval, eachYearOfInterval, addWeeks, isWithinInterval } from 'date-fns';

export function formatDate(date: Date, formatStr: string = 'MMM dd, yyyy'): string {
  return format(date, formatStr);
}

export function calculateAge(birthday: Date): number {
  return differenceInYears(new Date(), birthday);
}

export function calculateWeeksLived(birthday: Date): number {
  return differenceInWeeks(new Date(), birthday);
}

export function calculateWeeksRemaining(birthday: Date, lifeSpan: number = 71): number {
  const totalWeeks = lifeSpan * 52;
  const weeksLived = calculateWeeksLived(birthday);
  return Math.max(0, totalWeeks - weeksLived);
}

export function getWeekRange(weekNumber: number, year: number, weekStartDay: 'sunday' | 'monday' = 'sunday'): { start: Date; end: Date } {
  const firstDayOfYear = new Date(year, 0, 1);
  const start = startOfWeek(firstDayOfYear, { weekStartsOn: weekStartDay === 'sunday' ? 0 : 1 });
  const weekStart = addWeeks(start, weekNumber - 1);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: weekStartDay === 'sunday' ? 0 : 1 });
  return { start: weekStart, end: weekEnd };
}

export function getWeeksInYear(year: number): Date[] {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  return eachWeekOfInterval({ start, end });
}

export function getYearsRange(startYear: number, endYear: number): number[] {
  return eachYearOfInterval({ start: new Date(startYear, 0, 1), end: new Date(endYear, 0, 1) }).map(d => d.getFullYear());
}

export function getWeekNumber(date: Date, weekStartDay: 'sunday' | 'monday' = 'sunday'): number {
  const year = date.getFullYear();
  
  const firstDayOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  
  const firstDayOfWeek = firstDayOfYear.getDay();
  
  let weekNumber: number;
  
  if (weekStartDay === 'sunday') {
    const daysUntilFirstSunday = firstDayOfWeek === 0 ? 0 : 7 - firstDayOfWeek;
    
    if (dayOfYear <= daysUntilFirstSunday) {
      weekNumber = 1;
    } else {
      weekNumber = Math.ceil((dayOfYear - daysUntilFirstSunday) / 7);
    }
  } else {
    const daysUntilFirstMonday = firstDayOfWeek === 1 ? 0 : (firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek);
    
    if (dayOfYear <= daysUntilFirstMonday) {
      weekNumber = 1;
    } else {
      weekNumber = Math.ceil((dayOfYear - daysUntilFirstMonday) / 7);
    }
  }
  
  return Math.min(Math.max(weekNumber, 1), 52);
}

export function getCurrentWeekNumber(weekStartDay: 'sunday' | 'monday' = 'sunday'): number {
  return getWeekNumber(new Date(), weekStartDay);
}

export function isEventInDateRange(eventStart: Date, eventEnd: Date | undefined, dateRange: { start: Date | null; end: Date | null }): boolean {
  if (!dateRange.start || !dateRange.end) return true;
  const eventRange = {
    start: eventStart,
    end: eventEnd || eventStart,
  };
  return isWithinInterval(dateRange.start, eventRange) || 
         isWithinInterval(dateRange.end, eventRange) ||
         (eventStart <= dateRange.start && (eventEnd || eventStart) >= dateRange.end);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    personal: '#8b5cf6',
    work: '#f59e0b',
    health: '#10b981',
    family: '#ec4899',
    education: '#3b82f6',
    achievement: '#eab308',
    milestone: '#ef4444',
  };
  return colors[category] || '#64748b';
}
