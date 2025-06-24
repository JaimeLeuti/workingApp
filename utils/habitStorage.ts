import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitEntry, HabitStats } from '@/types/habit';

const HABITS_KEY = 'habits';
const HABIT_ENTRIES_KEY = 'habit_entries';

export const habitStorage = {
  // Habits CRUD
  async getHabits(): Promise<Habit[]> {
    try {
      const habitsJson = await AsyncStorage.getItem(HABITS_KEY);
      if (!habitsJson) return [];
      
      const habits = JSON.parse(habitsJson);
      return habits.map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
        reminderTime: habit.reminderTime ? new Date(habit.reminderTime) : undefined,
      }));
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  },

  async saveHabit(habit: Habit): Promise<void> {
    try {
      const habits = await this.getHabits();
      const existingIndex = habits.findIndex(h => h.id === habit.id);
      
      if (existingIndex >= 0) {
        habits[existingIndex] = habit;
      } else {
        habits.push(habit);
      }
      
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving habit:', error);
      throw error;
    }
  },

  async deleteHabit(habitId: string): Promise<void> {
    try {
      const habits = await this.getHabits();
      const filteredHabits = habits.filter(h => h.id !== habitId);
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filteredHabits));
      
      // Also delete all entries for this habit
      const entries = await this.getHabitEntries();
      const filteredEntries = entries.filter(e => e.habitId !== habitId);
      await AsyncStorage.setItem(HABIT_ENTRIES_KEY, JSON.stringify(filteredEntries));
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  // Habit Entries CRUD
  async getHabitEntries(): Promise<HabitEntry[]> {
    try {
      const entriesJson = await AsyncStorage.getItem(HABIT_ENTRIES_KEY);
      if (!entriesJson) return [];
      
      const entries = JSON.parse(entriesJson);
      return entries.map((entry: any) => ({
        ...entry,
        completedAt: entry.completedAt ? new Date(entry.completedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error loading habit entries:', error);
      return [];
    }
  },

  async saveHabitEntry(entry: HabitEntry): Promise<void> {
    try {
      const entries = await this.getHabitEntries();
      const existingIndex = entries.findIndex(
        e => e.habitId === entry.habitId && e.date === entry.date
      );
      
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }
      
      await AsyncStorage.setItem(HABIT_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving habit entry:', error);
      throw error;
    }
  },

  async getHabitEntriesForDate(date: string): Promise<HabitEntry[]> {
    try {
      const entries = await this.getHabitEntries();
      return entries.filter(entry => entry.date === date);
    } catch (error) {
      console.error('Error loading habit entries for date:', error);
      return [];
    }
  },

  async getHabitEntriesForHabit(habitId: string): Promise<HabitEntry[]> {
    try {
      const entries = await this.getHabitEntries();
      return entries.filter(entry => entry.habitId === habitId);
    } catch (error) {
      console.error('Error loading habit entries for habit:', error);
      return [];
    }
  },

  // Statistics
  async calculateHabitStats(habitId: string): Promise<HabitStats> {
    try {
      const entries = await this.getHabitEntriesForHabit(habitId);
      const completedEntries = entries.filter(e => e.completed);
      
      // Calculate streaks
      const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date();
      const todayStr = this.formatDate(today);
      const yesterdayStr = this.formatDate(new Date(today.getTime() - 24 * 60 * 60 * 1000));
      
      // Calculate current streak
      for (let i = 0; i < sortedEntries.length; i++) {
        const entry = sortedEntries[i];
        if (entry.completed) {
          if (i === 0 && (entry.date === todayStr || entry.date === yesterdayStr)) {
            currentStreak++;
          } else if (i > 0) {
            const prevDate = new Date(sortedEntries[i - 1].date);
            const currDate = new Date(entry.date);
            const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000));
            
            if (dayDiff === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        } else {
          break;
        }
      }
      
      // Calculate best streak
      for (const entry of sortedEntries) {
        if (entry.completed) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }
      
      // Calculate completion rate (last 30 days)
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentEntries = entries.filter(e => new Date(e.date) >= thirtyDaysAgo);
      const completionRate = recentEntries.length > 0 
        ? (recentEntries.filter(e => e.completed).length / recentEntries.length) * 100 
        : 0;
      
      // Calculate averages for measurable habits
      const measurableEntries = completedEntries.filter(e => e.value !== undefined);
      const averageValue = measurableEntries.length > 0
        ? measurableEntries.reduce((sum, e) => sum + (e.value || 0), 0) / measurableEntries.length
        : undefined;
      
      const totalValue = measurableEntries.length > 0
        ? measurableEntries.reduce((sum, e) => sum + (e.value || 0), 0)
        : undefined;
      
      return {
        habitId,
        currentStreak,
        bestStreak,
        totalCompletions: completedEntries.length,
        completionRate: Math.round(completionRate),
        averageValue,
        totalValue,
      };
    } catch (error) {
      console.error('Error calculating habit stats:', error);
      return {
        habitId,
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        completionRate: 0,
      };
    }
  },

  // Utility functions
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  },

  isHabitDueToday(habit: Habit, date: Date = new Date()): boolean {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    switch (habit.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return dayOfWeek === 1; // Monday
      case 'custom':
        return habit.customDays?.includes(dayOfWeek) || false;
      default:
        return false;
    }
  },
};