import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Plus, Check, Trash2, ChevronLeft, ChevronRight, Calendar, CircleCheck as CheckCircle2, Clock, Target, X, Home } from 'lucide-react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
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
  order: number; // Add order field for consistent sorting
}

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSimpleInput, setShowSimpleInput] = useState(false);
  const [showComplexForm, setShowComplexForm] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);

  // Listen for the "go to today" event from tab press
  useEffect(() => {
    const handleGoToToday = () => {
      goToToday();
    };

    window.addEventListener('goToToday', handleGoToToday);
    
    return () => {
      window.removeEventListener('goToToday', handleGoToToday);
    };
  }, []);

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
    return tasks
      .filter(task => task.dateKey === dateKey)
      .sort((a, b) => a.order - b.order); // Sort by order for consistent display
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

  const handleDateSelect = (selectedDate: Date) => {
    setCurrentDate(selectedDate);
    setShowCalendarPicker(false);
    setShowSimpleInput(false);
    setNewTaskTitle('');
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setShowSimpleInput(false);
    setNewTaskTitle('');
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const getNextOrder = () => {
    const currentTasks = getCurrentDateTasks();
    return currentTasks.length > 0 ? Math.max(...currentTasks.map(t => t.order)) + 1 : 0;
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
      order: getNextOrder(),
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
      order: getNextOrder(),
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

  const handleDragEnd = ({ data }: { data: Task[] }) => {
    // Update the order of tasks based on their new positions
    const updatedTasks = data.map((task, index) => ({
      ...task,
      order: index
    }));

    // Update the tasks state with reordered tasks
    setTasks(prev => {
      const otherDateTasks = prev.filter(task => task.dateKey !== getDateKey(currentDate));
      return [...otherDateTasks, ...updatedTasks];
    });
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

  const renderTaskItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <TaskCard
      task={item}
      onToggle={() => toggleTask(item.id)}
      onToggleSubtask={(subtaskId) => toggleSubtask(item.id, subtaskId)}
      onDelete={() => deleteTask(item.id)}
      formatTime={formatTime}
      drag={drag}
      isActive={isActive}
    />
  );

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
            
            <TouchableOpacity 
              style={styles.dateContainer}
              onPress={() => setShowCalendarPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
              <Text style={styles.dateSubtext}>
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateDate('next')}
              activeOpacity={0.7}
            >
              <ChevronRight size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Go to Today Button - Only show when not on today */}
          {!isToday() && (
            <TouchableOpacity
              style={styles.todayButton}
              onPress={goToToday}
              activeOpacity={0.8}
            >
              <Home size={14} color="#4F46E5" strokeWidth={2} />
              <Text style={styles.todayButtonText}>Go to Today</Text>
            </TouchableOpacity>
          )}

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
      <View style={styles.content}>
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
          <DraggableFlatList
            data={currentDateTasks}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskItem}
            contentContainerStyle={styles.tasksList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Calendar Picker Modal */}
      <CalendarPickerModal
        visible={showCalendarPicker}
        onClose={() => setShowCalendarPicker(false)}
        onDateSelect={handleDateSelect}
        selectedDate={currentDate}
      />

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

function CalendarPickerModal({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
}: {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
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
      days.push(new Date(year, month, day));
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

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDatePress = (date: Date) => {
    onDateSelect(date);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.calendarModalOverlay}>
        <View style={styles.calendarModalContainer}>
          {/* Header */}
          <View style={styles.calendarModalHeader}>
            <Text style={styles.calendarModalTitle}>Select Date</Text>
            <TouchableOpacity 
              style={styles.calendarCloseButton}
              onPress={onClose} 
              activeOpacity={0.7}
            >
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={styles.calendarNavigation}>
            <TouchableOpacity 
              style={styles.calendarNavButton}
              onPress={() => navigateMonth('prev')}
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
            
            <Text style={styles.calendarMonthTitle}>{formatMonth(currentMonth)}</Text>
            
            <TouchableOpacity 
              style={styles.calendarNavButton}
              onPress={() => navigateMonth('next')}
              activeOpacity={0.7}
            >
              <ChevronRight size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Week Days */}
          <View style={styles.calendarWeekDays}>
            {weekDays.map((day) => (
              <Text key={day} style={styles.calendarWeekDay}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  !date && styles.calendarEmptyDay,
                  isToday(date) && styles.calendarToday,
                  isSelected(date) && styles.calendarSelectedDay,
                  isPastDate(date) && styles.calendarPastDay,
                ]}
                onPress={() => date && handleDatePress(date)}
                disabled={!date}
                activeOpacity={0.7}
              >
                {date && (
                  <Text style={[
                    styles.calendarDayText,
                    isToday(date) && styles.calendarTodayText,
                    isSelected(date) && styles.calendarSelectedDayText,
                    isPastDate(date) && styles.calendarPastDayText,
                  ]}>
                    {date.getDate()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.calendarActions}>
            <TouchableOpacity
              style={styles.calendarTodayButton}
              onPress={goToToday}
              activeOpacity={0.8}
            >
              <Calendar size={16} color="#4F46E5" strokeWidth={2} />
              <Text style={styles.calendarTodayButtonText}>Go to Today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TaskCard({ 
  task, 
  onToggle, 
  onToggleSubtask, 
  onDelete, 
  formatTime,
  drag,
  isActive
}: { 
  task: Task; 
  onToggle: () => void; 
  onToggleSubtask: (subtaskId: string) => void;
  onDelete: () => void;
  formatTime: (date: Date) => string;
  drag: () => void;
  isActive: boolean;
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
    <TouchableOpacity 
      style={[
        styles.taskCard,
        isActive && styles.taskCardDragging
      ]}
      onLongPress={drag}
      disabled={isActive}
      activeOpacity={0.8}
    >
      <TouchableOpacity
        style={styles.taskContent}
        onPress={onToggle}
        activeOpacity={0.7}
        disabled={isActive}
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
                  <Target size={10} color="#7C3AED" strokeWidth={2} />
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
                  disabled={isActive}
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
        disabled={isActive}
      >
        <Trash2 size={16} color="#EF4444" strokeWidth={2} />
      </TouchableOpacity>
    </TouchableOpacity>
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
    paddingVertical: 8,
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
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    gap: 6,
  },
  todayButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
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
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#7C3AED',
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
    paddingBottom: 100, // Add padding for tab bar
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
    marginBottom: 8,
  },
  taskCardDragging: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.02 }],
    backgroundColor: '#FEFEFE',
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
    color: '#7C3AED',
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
  // Calendar Modal Styles
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  calendarModalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  calendarCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  calendarEmptyDay: {
    opacity: 0,
  },
  calendarToday: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  calendarSelectedDay: {
    backgroundColor: '#4F46E5',
  },
  calendarPastDay: {
    opacity: 0.4,
  },
  calendarDayText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  calendarTodayText: {
    color: '#4F46E5',
    fontFamily: 'Inter-SemiBold',
  },
  calendarSelectedDayText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  calendarPastDayText: {
    color: '#9CA3AF',
  },
  calendarActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  calendarTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  calendarTodayButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
  },
});