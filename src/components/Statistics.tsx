import { useApp } from '../store/AppContext';
import { CATEGORIES } from '../types';
import { calculateWeeksLived, calculateWeeksRemaining, calculateAge } from '../utils/dateUtils';

interface StatisticsProps {
  birthday: Date;
}

export default function Statistics({ birthday }: StatisticsProps) {
  const { state } = useApp();
  const { events, settings } = state;

  const totalEvents = events.length;
  const weeksLived = calculateWeeksLived(birthday);
  const weeksRemaining = calculateWeeksRemaining(birthday, settings.lifeSpan);
  const currentAge = calculateAge(birthday);

  const categoryBreakdown = CATEGORIES.map(cat => {
    const count = events.filter(e => e.category === cat.id).length;
    const percentage = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;
    return { ...cat, count, percentage };
  }).filter(c => c.count > 0);

  const eventsByYear = events.reduce((acc, event) => {
    const year = event.startDate.getFullYear();
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const yearsWithMostEvents = Object.entries(eventsByYear)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([year, count]) => ({ year: Number(year), count }));

  const lifeProgress = Math.round((weeksLived / (settings.lifeSpan * 52)) * 100);

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl p-4">
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">Current Age</p>
          <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">{currentAge}</p>
          <p className="text-xs text-primary-500 dark:text-primary-400">years old</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-4">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Weeks Lived</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">{weeksLived.toLocaleString()}</p>
          <p className="text-xs text-green-500 dark:text-green-400">of {settings.lifeSpan * 52}</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-xl p-4">
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Weeks Remaining</p>
          <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{weeksRemaining.toLocaleString()}</p>
          <p className="text-xs text-amber-500 dark:text-amber-400">until {settings.lifeSpan}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-4">
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Events</p>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{totalEvents}</p>
          <p className="text-xs text-purple-500 dark:text-purple-400">recorded</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Life Progress</h3>
        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500"
            style={{ width: `${lifeProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Birth ({birthday.getFullYear()})</span>
          <span>{lifeProgress}% complete</span>
          <span>{settings.lifeSpan} years</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Events by Category</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No events to analyze</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map(cat => (
                <div key={cat.id} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{cat.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat.count}</span>
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Most Active Years</h3>
          {yearsWithMostEvents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No events recorded yet</p>
          ) : (
            <div className="space-y-3">
              {yearsWithMostEvents.map(({ year, count }) => (
                <div key={year} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-12">{year}</span>
                  <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(count / totalEvents) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
