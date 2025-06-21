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
  Modal,
} from 'react-native';
import { Plus, Check, Trash2, ChevronLeft, ChevronRight, Calendar, CircleCheck as CheckCircle2, Clock, Target } from 'lucide-react-native';
import ComplexTaskForm from '@/components/ComplexTaskForm';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dateKey: string;
  subtasks?: Subtask[];
  startTime?: Date;
  duration?: number;
  isComplex?: boolean;
}

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSimpleInput, setShowSimpleInput] = useState(false);
  const [showComplexForm, setShowComplexForm] = useState(false);

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
        month: 'short',
        day: 'numeric',
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

  // Enhanced progress calculation that includes subtasks
  const calculateProgress = () => {
    const currentTasks = getCurrentDateTasks();
    if (currentTasks.length === 0) return { completed: 0, total: 0, percentage: 0 };

    let totalProgress = 0;
    let completedProgress = 0;

    currentTasks.forEach(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        // For tasks with subtasks, each subtask contributes to the task's completion
        const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
        const taskProgress = completedSubtasks / task.subtasks.length;
        
        totalProgress += 1;
        completedProgress += taskProgress;
      } else {
        // For simple tasks, it's either 0 or 1
        totalProgress += 1;
        completedProgress += task.completed ? 1 : 0;
      }
    });

    const percentage = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;
    
    return {
      completed: Math.round(completedProgress * 10) / 10, // Round to 1 decimal place
      total: totalProgress,
      percentage: Math.round(percentage)
    };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    setShowSimpleInput(false);
    setNewTaskTitle('');
  };

  const addSimpleTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      dateKey: getDateKey(currentDate),
      isComplex: false,
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setShowSimpleInput(false);
  };

  const addComplexTask = (taskData: {
    title: string;
    description: string;
    subtasks: Subtask[];
    startTime: Date | null;
    duration: number;
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description || undefined,
      completed: false,
      dateKey: getDateKey(currentDate),
      subtasks: taskData.subtasks,
      startTime: taskData.startTime || undefined,
      duration: taskData.duration || undefined,
      isComplex: true,
    };

    setTasks(prev => [...prev, newTask]);
    setShowComplexForm(false);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          
          // If the task has subtasks, mark all subtasks as completed/uncompleted
          if (task.subtasks && task.subtasks.length > 0) {
            return {
              ...task,
              completed: newCompleted,
              subtasks: task.subtasks.map(subtask => ({
                ...subtask,
                completed: newCompleted
              }))
            };
          }
          
          return { ...task, completed: newCompleted };
        }
        return task;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId && task.subtasks) {
          const updatedSubtasks = task.subtasks.map(subtask =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          );
          
          // Check if all subtasks are completed to mark the main task as completed
          const allSubtasksCompleted = updatedSubtasks.every(subtask => subtask.completed);
          
          return {
            ...task,
            subtasks: updatedSubtasks,
            completed: allSubtasksCompleted
          };
        }
        return task;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const currentDateTasks = getCurrentDateTasks();
  const progress = calculateProgress();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.dateNavigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateDate('prev')}
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color="#6B7280" strokeWidth={2} />
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
              <ChevronRight size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Enhanced Progress Card */}
          {progress.total > 0 && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.progressIconContainer}>
                  <CheckCircle2 size={20} color="#10B981" strokeWidth={2} />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>Progress</Text>
                  <Text style={styles.progressSubtitle}>
                    {progress.completed} of {progress.total} completed
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
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Task Section */}
        <View style={styles.addSection}>
          {!showSimpleInput ? (
            <View style={styles.addButtonsContainer}>
              <TouchableOpacity
                style={styles.complexTaskButton}
                onPress={() => setShowComplexForm(true)}
                activeOpacity={0.8}
              >
                <Target size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.complexTaskButtonText}>Complex Task</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.simpleTaskButton}
                onPress={() => setShowSimpleInput(true)}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.simpleTaskButtonText}>Simple Task</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addInputCard}>
              <TextInput
                style={styles.addInput}
                placeholder="What needs to be done?"
                placeholderTextColor="#9CA3AF"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                autoFocus
                onSubmitEditing={addSimpleTask}
                returnKeyType="done"
                multiline
              />
              <View style={styles.addInputActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowSimpleInput(false);
                    setNewTaskTitle('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={addSimpleTask}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Add task</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Tasks List */}
        {currentDateTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Calendar size={32} color="#9CA3AF" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first task to get started with your day
            </Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {currentDateTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onToggleSubtask={(subtaskId) => toggleSubtask(task.id, subtaskId)}
                onDelete={() => deleteTask(task.id)}
                formatTime={formatTime}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Complex Task Form Modal */}
      <Modal
        visible={showComplexForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ComplexTaskForm
          onSave={addComplexTask}
          onCancel={() => setShowComplexForm(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

function TaskCard({ 
  task, 
  onToggle, 
  onToggleSubtask, 
  onDelete, 
  formatTime 
}: { 
  task: Task; 
  onToggle: () => void; 
  onToggleSubtask: (subtaskId: string) => void;
  onDelete: () => void;
  formatTime: (date: Date) => string;
}) {
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  // Calculate task progress for display
  const getTaskProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    return Math.round((completedSubtasks / totalSubtasks) * 100);
  };

  const taskProgress = getTaskProgress();

  return (
    <View style={styles.taskCard}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.checkboxContainer}>
          <View style={[
            styles.checkbox,
            task.completed && styles.checkboxCompleted
          ]}>
            {task.completed && (
              <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </View>
        </View>

        <View style={styles.taskInfo}>
          <Text style={[
            styles.taskTitle,
            task.completed && styles.taskTitleCompleted
          ]}>
            {task.title}
          </Text>
          
          {task.description && (
            <Text style={styles.taskDescription}>{task.description}</Text>
          )}

          {/* Task Meta Info */}
          {(task.startTime || task.duration || task.isComplex) && (
            <View style={styles.taskMeta}>
              {task.startTime && (
                <View style={styles.metaItem}>
                  <Clock size={12} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.metaText}>{formatTime(task.startTime)}</Text>
                </View>
              )}
              
              {task.duration && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaText}>{task.duration}min</Text>
                </View>
              )}

              {task.isComplex && (
                <View style={styles.complexBadge}>
                  <Target size={10} color="#8B5CF6" strokeWidth={2} />
                  <Text style={styles.complexBadgeText}>Complex</Text>
                </View>
              )}
            </View>
          )}

          {/* Subtasks with Progress */}
          {task.subtasks && task.subtasks.length > 0 && (
            <View style={styles.subtasksContainer}>
              <View style={styles.subtasksHeaderContainer}>
                <Text style={styles.subtasksHeader}>
                  Subtasks ({completedSubtasks}/{totalSubtasks})
                </Text>
                <View style={styles.subtaskProgressContainer}>
                  <Text style={styles.subtaskProgressText}>{taskProgress}%</Text>
                  <View style={styles.subtaskProgressBar}>
                    <View 
                      style={[
                        styles.subtaskProgressFill, 
                        { width: `${taskProgress}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
              {task.subtasks.map((subtask) => (
                <TouchableOpacity
                  key={subtask.id}
                  style={styles.subtaskItem}
                  onPress={() => onToggleSubtask(subtask.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.subtaskCheckbox,
                    subtask.completed && styles.subtaskCheckboxCompleted
                  ]}>
                    {subtask.completed && (
                      <Check size={10} color="#FFFFFF" strokeWidth={2.5} />
                    )}
                  </View>
                  <Text style={[
                    styles.subtaskTitle,
                    subtask.completed && styles.subtaskTitleCompleted
                  ]}>
                    {subtask.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        activeOpacity={0.7}
      >
        <Trash2 size={16} color="#EF4444" strokeWidth={2} />
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  dateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  progressCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
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
    backgroundColor: '#DCFCE7',
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
    color: '#10B981',
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
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addSection: {
    marginBottom: 24,
  },
  addButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  complexTaskButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  complexTaskButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  simpleTaskButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  simpleTaskButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  addInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addInput: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 16,
    paddingVertical: 4,
    minHeight: 20,
  },
  addInputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
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
  },
  tasksList: {
    gap: 8,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  complexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  complexBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtasksContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subtasksHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtasksHeader: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  subtaskProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtaskProgressText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    minWidth: 28,
  },
  subtaskProgressBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  subtaskProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subtaskCheckbox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  subtaskCheckboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  subtaskTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});