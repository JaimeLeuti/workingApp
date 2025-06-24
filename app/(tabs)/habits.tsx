import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Target, 
  TrendingUp, 
  Calendar,
  Filter,
  BarChart3,
  Clock,
  Edit3,
  Archive,
  Trash2
} from 'lucide-react-native';
import HabitForm from '@/components/HabitForm';
import HabitStats from '@/components/HabitStats';
import MeasurableHabitInput from '@/components/MeasurableHabitInput';

export interface Habit {
  id: string;
  name: string;
  type: 'yes_no' | 'measurable';
  target_value?: number;
  unit?: string;
  question?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  custom_days?: number[]; // 0-6 for Sunday-Saturday
  reminder_time?: string;
  notes?: string;
  color: string;
  icon?: string;
  created_at: Date;
  archived: boolean;
}

export interface HabitEntry {
  habit_id: string;
  date: string; // YYYY-MM-DD
  value: boolean | number;
  created_at: Date;
}

type FilterType = 'all' | 'completed' | 'missed';
type ModalState = 'none' | 'create' | 'edit' | 'stats' | 'input';

const HABIT_COLORS = [
  '#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#06B6D4', '#8B5CF6', '#84CC16', '#F97316'
];

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [modalState, setModalState] = useState<ModalState>('none');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentDate] = useState(new Date());

  const today = currentDate.toISOString().split('T')[0];

  // Get habits that are due today based on their frequency
  const getTodaysHabits = () => {
    const todayDayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    return habits.filter(habit => {
      if (habit.archived) return false;
      
      switch (habit.frequency) {
        case 'daily':
          return true;
        case 'weekly':
          // For weekly habits, show them every day but track completion per week
          return true;
        case 'custom':
          return habit.custom_days?.includes(todayDayOfWeek) || false;
        default:
          return false;
      }
    });
  };

  // Get today's entry for a habit
  const getTodaysEntry = (habitId: string): HabitEntry | null => {
    return entries.find(entry => 
      entry.habit_id === habitId && entry.date === today
    ) || null;
  };

  // Check if habit is completed today
  const isHabitCompleted = (habit: Habit): boolean => {
    const entry = getTodaysEntry(habit.id);
    if (!entry) return false;
    
    if (habit.type === 'yes_no') {
      return entry.value === true;
    } else {
      return typeof entry.value === 'number' && entry.value >= (habit.target_value || 0);
    }
  };

  // Get filtered habits based on current filter
  const getFilteredHabits = () => {
    const todaysHabits = getTodaysHabits();
    
    switch (filter) {
      case 'completed':
        return todaysHabits.filter(habit => isHabitCompleted(habit));
      case 'missed':
        return todaysHabits.filter(habit => !isHabitCompleted(habit));
      default:
        return todaysHabits;
    }
  };

  // Calculate today's progress
  const getTodaysProgress = () => {
    const todaysHabits = getTodaysHabits();
    const completedCount = todaysHabits.filter(habit => isHabitCompleted(habit)).length;
    return {
      completed: completedCount,
      total: todaysHabits.length,
      percentage: todaysHabits.length > 0 ? Math.round((completedCount / todaysHabits.length) * 100) : 0
    };
  };

  // Toggle yes/no habit
  const toggleYesNoHabit = (habit: Habit) => {
    const existingEntry = getTodaysEntry(habit.id);
    
    if (existingEntry) {
      // Update existing entry
      setEntries(prev => prev.map(entry => 
        entry.habit_id === habit.id && entry.date === today
          ? { ...entry, value: !entry.value }
          : entry
      ));
    } else {
      // Create new entry
      const newEntry: HabitEntry = {
        habit_id: habit.id,
        date: today,
        value: true,
        created_at: new Date()
      };
      setEntries(prev => [...prev, newEntry]);
    }
  };

  // Open measurable habit input
  const openMeasurableInput = (habit: Habit) => {
    setSelectedHabit(habit);
    setModalState('input');
  };

  // Save measurable habit value
  const saveMeasurableValue = (value: number) => {
    if (!selectedHabit) return;
    
    const existingEntry = getTodaysEntry(selectedHabit.id);
    
    if (existingEntry) {
      // Update existing entry
      setEntries(prev => prev.map(entry => 
        entry.habit_id === selectedHabit.id && entry.date === today
          ? { ...entry, value: value }
          : entry
      ));
    } else {
      // Create new entry
      const newEntry: HabitEntry = {
        habit_id: selectedHabit.id,
        date: today,
        value: value,
        created_at: new Date()
      };
      setEntries(prev => [...prev, newEntry]);
    }
    
    setModalState('none');
    setSelectedHabit(null);
  };

  // Modal handlers
  const openCreateModal = () => {
    setEditingHabit(null);
    setModalState('create');
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setModalState('edit');
  };

  const openStatsModal = (habit: Habit) => {
    setSelectedHabit(habit);
    setModalState('stats');
  };

  const closeModal = () => {
    setModalState('none');
    setEditingHabit(null);
    setSelectedHabit(null);
  };

  // Save habit (create or edit)
  const saveHabit = (habitData: Omit<Habit, 'id' | 'created_at'>) => {
    if (editingHabit) {
      // Update existing habit
      setHabits(prev => prev.map(habit => 
        habit.id === editingHabit.id 
          ? { ...habitData, id: editingHabit.id, created_at: editingHabit.created_at }
          : habit
      ));
    } else {
      // Create new habit
      const newHabit: Habit = {
        ...habitData,
        id: Date.now().toString(),
        created_at: new Date(),
      };
      setHabits(prev => [...prev, newHabit]);
    }
    closeModal();
  };

  // Archive habit
  const archiveHabit = (habitId: string) => {
    Alert.alert(
      'Archive Habit',
      'Are you sure you want to archive this habit? It will no longer appear in your tracker.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Archive', 
          style: 'destructive',
          onPress: () => {
            setHabits(prev => prev.map(habit => 
              habit.id === habitId ? { ...habit, archived: true } : habit
            ));
          }
        },
      ]
    );
  };

  // Delete habit
  const deleteHabit = (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to permanently delete this habit? All tracking data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setHabits(prev => prev.filter(habit => habit.id !== habitId));
            setEntries(prev => prev.filter(entry => entry.habit_id !== habitId));
          }
        },
      ]
    );
  };

  const progress = getTodaysProgress();
  const filteredHabits = getFilteredHabits();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Habits</Text>
              <Text style={styles.headerSubtitle}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={openCreateModal}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Progress Card */}
          {progress.total > 0 && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.progressIconContainer}>
                  <Target size={20} color="#4F46E5" strokeWidth={2} />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>Today's Progress</Text>
                  <Text style={styles.progressSubtitle}>
                    {progress.completed} of {progress.total} habits completed
                  </Text>
                </View>
                <Text style={styles.progressPercentage}>
                  {progress.percentage}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${progress.percentage}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          )}

          {/* Filter Buttons */}
          {progress.total > 0 && (
            <View style={styles.filterContainer}>
              {[
                { key: 'all', label: 'All', count: getTodaysHabits().length },
                { key: 'completed', label: 'Completed', count: progress.completed },
                { key: 'missed', label: 'Missed', count: progress.total - progress.completed }
              ].map((filterOption) => (
                <TouchableOpacity
                  key={filterOption.key}
                  style={[
                    styles.filterButton,
                    filter === filterOption.key && styles.filterButtonActive
                  ]}
                  onPress={() => setFilter(filterOption.key as FilterType)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filter === filterOption.key && styles.filterButtonTextActive
                  ]}>
                    {filterOption.label} ({filterOption.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Target size={32} color="#9CA3AF" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              {habits.length === 0 ? 'No habits yet' : 'No habits for this filter'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {habits.length === 0 
                ? 'Create your first habit to start building better routines'
                : 'Try changing your filter or create a new habit'
              }
            </Text>
            {habits.length === 0 && (
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={openCreateModal}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.emptyActionButtonText}>Create Habit</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.habitsList}>
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                entry={getTodaysEntry(habit.id)}
                isCompleted={isHabitCompleted(habit)}
                onToggle={() => toggleYesNoHabit(habit)}
                onMeasurableInput={() => openMeasurableInput(habit)}
                onEdit={() => openEditModal(habit)}
                onStats={() => openStatsModal(habit)}
                onArchive={() => archiveHabit(habit.id)}
                onDelete={() => deleteHabit(habit.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Habit Form Modal */}
      <Modal
        visible={modalState === 'create' || modalState === 'edit'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeModal}
      >
        <HabitForm
          habit={editingHabit}
          onSave={saveHabit}
          onCancel={closeModal}
          isEditing={modalState === 'edit'}
          availableColors={HABIT_COLORS}
        />
      </Modal>

      {/* Habit Stats Modal */}
      <Modal
        visible={modalState === 'stats'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeModal}
      >
        {selectedHabit && (
          <HabitStats
            habit={selectedHabit}
            entries={entries.filter(entry => entry.habit_id === selectedHabit.id)}
            onClose={closeModal}
          />
        )}
      </Modal>

      {/* Measurable Input Modal */}
      <Modal
        visible={modalState === 'input'}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        {selectedHabit && (
          <MeasurableHabitInput
            habit={selectedHabit}
            currentValue={getTodaysEntry(selectedHabit.id)?.value as number || 0}
            onSave={saveMeasurableValue}
            onCancel={closeModal}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

function HabitCard({ 
  habit, 
  entry, 
  isCompleted, 
  onToggle, 
  onMeasurableInput, 
  onEdit, 
  onStats, 
  onArchive, 
  onDelete 
}: {
  habit: Habit;
  entry: HabitEntry | null;
  isCompleted: boolean;
  onToggle: () => void;
  onMeasurableInput: () => void;
  onEdit: () => void;
  onStats: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  const getCurrentValue = () => {
    if (habit.type === 'measurable' && entry) {
      return entry.value as number;
    }
    return 0;
  };

  const getProgressPercentage = () => {
    if (habit.type === 'measurable' && habit.target_value) {
      const current = getCurrentValue();
      return Math.min((current / habit.target_value) * 100, 100);
    }
    return isCompleted ? 100 : 0;
  };

  return (
    <View style={styles.habitCard}>
      <View style={[styles.habitColorBar, { backgroundColor: habit.color }]} />
      
      <View style={styles.habitContent}>
        <View style={styles.habitHeader}>
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{habit.name}</Text>
            {habit.question && (
              <Text style={styles.habitQuestion}>{habit.question}</Text>
            )}
            <View style={styles.habitMeta}>
              <Text style={styles.habitFrequency}>
                {habit.frequency === 'daily' ? 'Daily' : 
                 habit.frequency === 'weekly' ? 'Weekly' : 'Custom'}
              </Text>
              {habit.reminder_time && (
                <>
                  <View style={styles.metaDivider} />
                  <Clock size={10} color="#9CA3AF" strokeWidth={2} />
                  <Text style={styles.habitReminder}>{habit.reminder_time}</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.habitActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowActions(!showActions)}
              activeOpacity={0.7}
            >
              <Edit3 size={16} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.habitProgress}>
          {habit.type === 'yes_no' ? (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={onToggle}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                isCompleted && styles.checkboxCompleted,
                { borderColor: habit.color }
              ]}>
                {isCompleted && (
                  <CheckCircle2 size={20} color={habit.color} strokeWidth={2.5} />
                )}
              </View>
              <Text style={[
                styles.checkboxLabel,
                isCompleted && styles.checkboxLabelCompleted
              ]}>
                {isCompleted ? 'Completed' : 'Mark as done'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.measurableContainer}
              onPress={onMeasurableInput}
              activeOpacity={0.7}
            >
              <View style={styles.measurableInfo}>
                <Text style={styles.measurableValue}>
                  {getCurrentValue()} / {habit.target_value} {habit.unit}
                </Text>
                <Text style={styles.measurablePercentage}>
                  {Math.round(getProgressPercentage())}%
                </Text>
              </View>
              <View style={styles.measurableProgressBar}>
                <View 
                  style={[
                    styles.measurableProgressFill, 
                    { 
                      width: `${getProgressPercentage()}%`,
                      backgroundColor: habit.color 
                    }
                  ]} 
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Menu */}
        {showActions && (
          <View style={styles.actionMenu}>
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                onStats();
                setShowActions(false);
              }}
              activeOpacity={0.7}
            >
              <BarChart3 size={16} color="#4F46E5" strokeWidth={2} />
              <Text style={styles.actionMenuText}>View Stats</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                onEdit();
                setShowActions(false);
              }}
              activeOpacity={0.7}
            >
              <Edit3 size={16} color="#6B7280" strokeWidth={2} />
              <Text style={styles.actionMenuText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                onArchive();
                setShowActions(false);
              }}
              activeOpacity={0.7}
            >
              <Archive size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.actionMenuText}>Archive</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                onDelete();
                setShowActions(false);
              }}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="#EF4444" strokeWidth={2} />
              <Text style={styles.actionMenuText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  progressSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  progressPercentage: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4F46E5',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyActionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  habitsList: {
    paddingBottom: 100,
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  habitColorBar: {
    height: 4,
  },
  habitContent: {
    padding: 16,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  habitInfo: {
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
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  habitFrequency: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
  },
  habitReminder: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  habitActions: {
    marginLeft: 12,
  },
  actionButton: {
    padding: 6,
  },
  habitProgress: {
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: 'transparent',
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  checkboxLabelCompleted: {
    color: '#10B981',
    fontFamily: 'Inter-SemiBold',
  },
  measurableContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  measurableInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  measurableValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  measurablePercentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
  },
  measurableProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  measurableProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionMenu: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionMenuText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 8,
  },
});