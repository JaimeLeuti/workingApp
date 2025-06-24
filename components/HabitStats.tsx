import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { X, TrendingUp, Calendar, Target, Award, ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { Habit, HabitEntry } from '@/app/(tabs)/habits';

interface HabitStatsProps {
  habit: Habit;
  entries: HabitEntry[];
  onClose: () => void;
}

export default function HabitStats({ habit, entries, onClose }: HabitStatsProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calculate statistics
  const calculateStats = () => {
    const now = new Date();
    const createdDate = new Date(habit.created_at);
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    let completedDays = 0;
    let totalValue = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate completion and streaks
    for (let i = 0; i < daysSinceCreation; i++) {
      const checkDate = new Date(createdDate);
      checkDate.setDate(checkDate.getDate() + i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      const entry = sortedEntries.find(e => e.date === dateString);
      let isCompleted = false;

      if (entry) {
        if (habit.type === 'yes_no') {
          isCompleted = entry.value === true;
        } else {
          isCompleted = typeof entry.value === 'number' && entry.value >= (habit.target_value || 0);
          totalValue += entry.value as number;
        }
      }

      if (isCompleted) {
        completedDays++;
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Current streak is the temp streak if it extends to today
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(e => e.date === today);
    let todayCompleted = false;

    if (todayEntry) {
      if (habit.type === 'yes_no') {
        todayCompleted = todayEntry.value === true;
      } else {
        todayCompleted = typeof todayEntry.value === 'number' && todayEntry.value >= (habit.target_value || 0);
      }
    }

    currentStreak = todayCompleted ? tempStreak : 0;

    const completionRate = daysSinceCreation > 0 ? Math.round((completedDays / daysSinceCreation) * 100) : 0;

    return {
      completionRate,
      currentStreak,
      bestStreak,
      totalCompletions: completedDays,
      totalValue: habit.type === 'measurable' ? totalValue : undefined,
      daysSinceCreation,
    };
  };

  // Get calendar data for current month
  const getCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const entry = entries.find(e => e.date === dateString);
      
      let status: 'completed' | 'partial' | 'missed' | 'future' = 'missed';
      let value: number | boolean | null = null;

      if (date > new Date()) {
        status = 'future';
      } else if (entry) {
        value = entry.value;
        if (habit.type === 'yes_no') {
          status = entry.value === true ? 'completed' : 'missed';
        } else {
          const target = habit.target_value || 0;
          const current = entry.value as number;
          if (current >= target) {
            status = 'completed';
          } else if (current > 0) {
            status = 'partial';
          } else {
            status = 'missed';
          }
        }
      }

      days.push({
        date,
        day,
        status,
        value,
        dateString,
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const stats = calculateStats();
  const calendarData = getCalendarData();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Habit Statistics</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <X size={20} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Habit Info */}
        <View style={styles.habitInfo}>
          <View style={[styles.habitColorBar, { backgroundColor: habit.color }]} />
          <View style={styles.habitDetails}>
            <Text style={styles.habitName}>{habit.name}</Text>
            {habit.question && (
              <Text style={styles.habitQuestion}>{habit.question}</Text>
            )}
            <Text style={styles.habitType}>
              {habit.type === 'yes_no' ? 'Yes/No Habit' : `Measurable Habit (${habit.unit})`}
            </Text>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={20} color="#10B981" strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stats.completionRate}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Target size={20} color="#F59E0B" strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Award size={20} color="#8B5CF6" strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stats.bestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Calendar size={20} color="#06B6D4" strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stats.totalCompletions}</Text>
              <Text style={styles.statLabel}>Total Completions</Text>
            </View>
          </View>

          {habit.type === 'measurable' && stats.totalValue !== undefined && (
            <View style={styles.totalValueCard}>
              <Text style={styles.totalValueNumber}>
                {stats.totalValue} {habit.unit}
              </Text>
              <Text style={styles.totalValueLabel}>Total Progress</Text>
            </View>
          )}
        </View>

        {/* Calendar View */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
            
            <Text style={styles.monthTitle}>{formatMonth(currentMonth)}</Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
              activeOpacity={0.7}
            >
              <ChevronRight size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Week Days Header */}
          <View style={styles.weekDaysContainer}>
            {weekDays.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarData.map((dayData, index) => (
              <View
                key={index}
                style={[
                  styles.dayCell,
                  !dayData && styles.emptyCell,
                  dayData?.status === 'completed' && styles.completedDay,
                  dayData?.status === 'partial' && styles.partialDay,
                  dayData?.status === 'missed' && styles.missedDay,
                  dayData?.status === 'future' && styles.futureDay,
                ]}
              >
                {dayData && (
                  <>
                    <Text style={[
                      styles.dayText,
                      dayData.status === 'completed' && styles.completedDayText,
                      dayData.status === 'partial' && styles.partialDayText,
                      dayData.status === 'future' && styles.futureDayText,
                    ]}>
                      {dayData.day}
                    </Text>
                    {habit.type === 'measurable' && dayData.value && typeof dayData.value === 'number' && (
                      <Text style={[
                        styles.dayValue,
                        dayData.status === 'completed' && styles.completedDayText,
                        dayData.status === 'partial' && styles.partialDayText,
                      ]}>
                        {dayData.value}
                      </Text>
                    )}
                  </>
                )}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.completedDay]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
            {habit.type === 'measurable' && (
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.partialDay]} />
                <Text style={styles.legendText}>Partial</Text>
              </View>
            )}
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.missedDay]} />
              <Text style={styles.legendText}>Missed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.futureDay]} />
              <Text style={styles.legendText}>Future</Text>
            </View>
          </View>
        </View>

        {/* Recent History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          {entries.length === 0 ? (
            <Text style={styles.noHistoryText}>No tracking data yet</Text>
          ) : (
            <View style={styles.historyList}>
              {entries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((entry) => (
                  <View key={`${entry.habit_id}-${entry.date}`} style={styles.historyItem}>
                    <Text style={styles.historyDate}>
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.historyValue}>
                      {habit.type === 'yes_no' 
                        ? (entry.value ? 'Completed' : 'Not completed')
                        : `${entry.value} ${habit.unit}`
                      }
                    </Text>
                  </View>
                ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  habitInfo: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  habitColorBar: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  habitQuestion: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  habitType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  totalValueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  totalValueNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  totalValueLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  calendarSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    paddingVertical: 6,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 2,
    backgroundColor: '#F8FAFC',
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  completedDay: {
    backgroundColor: '#DCFCE7',
  },
  partialDay: {
    backgroundColor: '#FEF3C7',
  },
  missedDay: {
    backgroundColor: '#FEE2E2',
  },
  futureDay: {
    backgroundColor: '#F3F4F6',
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  completedDayText: {
    color: '#059669',
    fontFamily: 'Inter-SemiBold',
  },
  partialDayText: {
    color: '#D97706',
    fontFamily: 'Inter-SemiBold',
  },
  futureDayText: {
    color: '#9CA3AF',
  },
  dayValue: {
    fontSize: 8,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  historySection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  noHistoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyDate: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  historyValue: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
});