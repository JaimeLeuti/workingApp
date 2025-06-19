import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { 
  Plus, 
  Check, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react-native';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dateKey: string;
}

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddInput, setShowAddInput] = useState(false);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    }
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getCurrentDateTasks = () => {
    const dateKey = getDateKey(currentDate);
    return tasks.filter(task => task.dateKey === dateKey);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    setShowAddInput(false);
    setNewTaskTitle('');
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      dateKey: getDateKey(currentDate),
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setShowAddInput(false);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const currentDateTasks = getCurrentDateTasks();
  const completedTasks = currentDateTasks.filter(task => task.completed).length;
  const totalTasks = currentDateTasks.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dateNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateDate('prev')}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#6B7280" strokeWidth={2.5} />
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
            <Text style={styles.dateSubtext}>
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateDate('next')}
            activeOpacity={0.7}
          >
            <ChevronRight size={20} color="#6B7280" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressIcon}>
              <Zap size={20} color="#6366F1" strokeWidth={2.5} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Daily Progress</Text>
              <Text style={styles.progressSubtitle}>
                {completedTasks}/{totalTasks} tasks completed
              </Text>
            </View>
            <Text style={styles.progressCount}>{completedTasks}/{totalTasks}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Add Task Section */}
        <View style={styles.addSection}>
          {!showAddInput ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddInput(true)}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addInputContainer}>
              <TextInput
                style={styles.addInput}
                placeholder="What do you need to do?"
                placeholderTextColor="#9CA3AF"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                autoFocus
                onSubmitEditing={addTask}
                returnKeyType="done"
              />
              <View style={styles.addInputButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddInput(false);
                    setNewTaskTitle('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={addTask}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Tasks List */}
        <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
          {currentDateTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Zap size={48} color="#6366F1" strokeWidth={2} />
              </View>
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first task to get started
              </Text>
            </View>
          ) : (
            currentDateTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleTask(task.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkboxInner,
                    task.completed && styles.checkboxCompleted
                  ]}>
                    {task.completed && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>

                <Text style={[
                  styles.taskTitle,
                  task.completed && styles.taskTitleCompleted
                ]}>
                  {task.title}
                </Text>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTask(task.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={18} color="#EF4444" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  dateSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  progressCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  progressSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  progressCount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#6366F1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  addSection: {
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  addInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  addInput: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 16,
    paddingVertical: 8,
  },
  addInputButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  tasksList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  checkbox: {
    marginRight: 16,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    lineHeight: 22,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
  },
});