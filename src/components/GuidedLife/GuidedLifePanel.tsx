import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchYearlyGoals, saveYearlyGoals, fetchQuarterlyObjectives, saveQuarterlyObjectives, fetchMonthlyMilestones, saveMonthlyMilestones } from '../../services/sync';

interface GuidedLifePanelProps {
  userId: string | null;
  isPremium: boolean;
}

export default function GuidedLifePanel({ userId, isPremium }: GuidedLifePanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('yearly');
  const [yearlyGoals, setYearlyGoals] = useState<string[]>([]);
  const [quarterlyObjectives, setQuarterlyObjectives] = useState<string[]>([]);
  const [monthlyMilestones, setMonthlyMilestones] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    if (userId) {
      loadGoals();
    }
  }, [userId]);

  const loadGoals = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [yearly, quarterly, monthly] = await Promise.all([
        fetchYearlyGoals(userId, currentYear),
        fetchQuarterlyObjectives(userId, currentYear, currentQuarter),
        fetchMonthlyMilestones(userId, currentYear, currentMonth),
      ]);
      setYearlyGoals(yearly);
      setQuarterlyObjectives(quarterly);
      setMonthlyMilestones(monthly);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddYearlyGoal = async () => {
    if (!newGoal.trim() || !userId) return;
    const updatedGoals = [...yearlyGoals, newGoal.trim()];
    setSaving(true);
    try {
      await saveYearlyGoals(userId, currentYear, updatedGoals);
      setYearlyGoals(updatedGoals);
      setNewGoal('');
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveYearlyGoal = async (index: number) => {
    if (!userId) return;
    const updatedGoals = yearlyGoals.filter((_, i) => i !== index);
    setSaving(true);
    try {
      await saveYearlyGoals(userId, currentYear, updatedGoals);
      setYearlyGoals(updatedGoals);
    } catch (error) {
      console.error('Error removing goal:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuarterlyObjective = async (objective: string) => {
    if (!objective.trim() || !userId) return;
    const updatedObjectives = [...quarterlyObjectives, objective.trim()];
    setSaving(true);
    try {
      await saveQuarterlyObjectives(userId, currentYear, currentQuarter, updatedObjectives);
      setQuarterlyObjectives(updatedObjectives);
    } catch (error) {
      console.error('Error saving objective:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveQuarterlyObjective = async (index: number) => {
    if (!userId) return;
    const updatedObjectives = quarterlyObjectives.filter((_, i) => i !== index);
    setSaving(true);
    try {
      await saveQuarterlyObjectives(userId, currentYear, currentQuarter, updatedObjectives);
      setQuarterlyObjectives(updatedObjectives);
    } catch (error) {
      console.error('Error removing objective:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMonthlyMilestone = async (milestone: string) => {
    if (!milestone.trim() || !userId) return;
    const updatedMilestones = [...monthlyMilestones, milestone.trim()];
    setSaving(true);
    try {
      await saveMonthlyMilestones(userId, currentYear, currentMonth, updatedMilestones);
      setMonthlyMilestones(updatedMilestones);
    } catch (error) {
      console.error('Error saving milestone:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMonthlyMilestone = async (index: number) => {
    if (!userId) return;
    const updatedMilestones = monthlyMilestones.filter((_, i) => i !== index);
    setSaving(true);
    try {
      await saveMonthlyMilestones(userId, currentYear, currentMonth, updatedMilestones);
      setMonthlyMilestones(updatedMilestones);
    } catch (error) {
      console.error('Error removing milestone:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const quarterlyProgress = Math.round((monthlyMilestones.length / 4) * 100);
  const yearlyProgress = yearlyGoals.length > 0 ? Math.round((yearlyGoals.filter(g => g.startsWith('✓')).length / yearlyGoals.length) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Guided Life</h2>
        {!isPremium && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            Free
          </span>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Yearly Goals */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('yearly')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">Year {currentYear}</span>
                <span className="text-xs text-gray-500">{yearlyGoals.length} goals</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${yearlyProgress}%` }} />
                </div>
                {expandedSection === 'yearly' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            
            {expandedSection === 'yearly' && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={e => setNewGoal(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddYearlyGoal()}
                    placeholder="Add a yearly goal..."
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                  <button
                    onClick={handleAddYearlyGoal}
                    disabled={saving || !newGoal.trim()}
                    className="p-1.5 rounded-lg bg-primary-500 text-white disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {yearlyGoals.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No yearly goals set. Start with 3 big goals for this year.</p>
                ) : (
                  <ul className="space-y-1">
                    {yearlyGoals.map((goal, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={goal.startsWith('✓')}
                          onChange={async () => {
                            const updated = [...yearlyGoals];
                            updated[index] = goal.startsWith('✓') ? goal.substring(1) : '✓ ' + goal;
                            setYearlyGoals(updated);
                            if (userId) {
                              setSaving(true);
                              await saveYearlyGoals(userId, currentYear, updated);
                              setSaving(false);
                            }
                          }}
                          className="rounded"
                        />
                        <span className={goal.startsWith('✓') ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
                          {goal.startsWith('✓') ? goal.substring(1) : goal}
                        </span>
                        <button
                          onClick={() => handleRemoveYearlyGoal(index)}
                          className="ml-auto p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Quarterly Objectives */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('quarterly')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">Q{currentQuarter} {currentYear}</span>
                <span className="text-xs text-gray-500">{quarterlyObjectives.length} objectives</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${quarterlyProgress}%` }} />
                </div>
                {expandedSection === 'quarterly' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            
            {expandedSection === 'quarterly' && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <GoalInput onAdd={handleAddQuarterlyObjective} placeholder="Add quarterly objective..." />
                {quarterlyObjectives.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Break down your yearly goals into quarterly objectives.</p>
                ) : (
                  <ul className="space-y-1">
                    {quarterlyObjectives.map((obj, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" />
                        {obj}
                        <button
                          onClick={() => handleRemoveQuarterlyObjective(index)}
                          className="ml-auto p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Monthly Milestones */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('monthly')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}
                </span>
                <span className="text-xs text-gray-500">{monthlyMilestones.length} milestones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${quarterlyProgress}%` }} />
                </div>
                {expandedSection === 'monthly' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            
            {expandedSection === 'monthly' && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <GoalInput onAdd={handleAddMonthlyMilestone} placeholder="Add monthly milestone..." />
                {monthlyMilestones.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Set specific milestones to achieve this month.</p>
                ) : (
                  <ul className="space-y-1">
                    {monthlyMilestones.map((milestone, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="w-4 h-4 text-green-500" />
                        {milestone}
                        <button
                          onClick={() => handleRemoveMonthlyMilestone(index)}
                          className="ml-auto p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!userId && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Sign in to save your goals to the cloud
        </p>
      )}
    </div>
  );
}

function GoalInput({ onAdd, placeholder }: { onAdd: (value: string) => void; placeholder: string }) {
  const [value, setValue] = useState('');
  
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && (onAdd(value), setValue(''))}
        placeholder={placeholder}
        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
      />
      <button
        onClick={() => { onAdd(value); setValue(''); }}
        disabled={!value.trim()}
        className="p-1.5 rounded-lg bg-green-500 text-white disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
