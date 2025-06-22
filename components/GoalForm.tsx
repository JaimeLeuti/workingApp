import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView,
  Modal,
} from 'react-native';
import { X, Target, SquareCheck as CheckSquare, Calendar, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'quantifiable' | 'non-quantifiable';
  // For quantifiable goals
  targetNumber?: number;
  unit?: string;
  currentProgress?: number;
  // For non-quantifiable goals
  linkedTasks?: string[];
  // Common fields
  deadline?: Date;
  category: string;
  customCategory?: string;
  color: string;
  isCompleted: boolean;
  createdAt: Date;
}

interface GoalFormProps {
  goal: Goal | null;
  onSave: (goalData: Omit<Goal, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const DEFAULT_CATEGORIES = [
  { name: 'Health', color: '#10B981' },
  { name: 'Work', color: '#06B6D4' },
  { name: 'Learning', color: '#8B5CF6' },
  { name: 'Personal', color: '#F59E0B' },
  { name: 'Fitness', color: '#84CC16' },
];

export default function GoalForm({ goal, onSave, onCancel, isEditing }: GoalFormProps) {
  // Basic fields
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [goalType, setGoalType] = useState<'quantifiable' | 'non-quantifiable'>(
    goal?.type || 'quantifiable'
  );

  // Quantifiable goal fields
  const [targetNumber, setTargetNumber] = useState(goal?.targetNumber?.toString() || '');
  const [unit, setUnit] = useState(goal?.unit || '');
  const [currentProgress, setCurrentProgress] = useState(goal?.currentProgress?.toString() || '0');

  // Non-quantifiable goal fields (placeholder for future task linking)
  const [linkedTasks] = useState<string[]>(goal?.linkedTasks || []);

  // Common fields
  const [deadline, setDeadline] = useState<Date | null>(goal?.deadline || null);
  const [selectedCategory, setSelectedCategory] = useState(goal?.category || DEFAULT_CATEGORIES[0].name);
  const [customCategory, setCustomCategory] = useState(goal?.customCategory || '');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get available categories (default + custom)
  const [customCategories, setCustomCategories] = useState<Array<{name: string, color: string}>>([]);
  
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories,
    ...(showCustomCategory ? [] : [{ name: 'Custom...', color: '#6B7280' }])
  ];

  const selectedCategoryData = allCategories.find(cat => cat.name === selectedCategory) || DEFAULT_CATEGORIES[0];

  const handleCategorySelect = (categoryName: string) => {
    if (categoryName === 'Custom...') {
      setShowCustomCategory(true);
      setSelectedCategory('');
    } else {
      setSelectedCategory(categoryName);
      setShowCustomCategory(false);
      setCustomCategory('');
    }
  };

  const handleCustomCategoryAdd = () => {
    if (!customCategory.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const newCategory = {
      name: customCategory.trim(),
      color: '#6366F1' // Default color for custom categories
    };

    setCustomCategories(prev => [...prev, newCategory]);
    setSelectedCategory(newCategory.name);
    setShowCustomCategory(false);
    setCustomCategory('');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDateSelect = (selectedDate: Date) => {
    setDeadline(selectedDate);
    setShowDatePicker(false);
  };

  const clearDeadline = () => {
    setDeadline(null);
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return false;
    }

    if (goalType === 'quantifiable') {
      const targetNum = parseInt(targetNumber, 10);
      if (!targetNumber || isNaN(targetNum) || targetNum <= 0) {
        Alert.alert('Error', 'Please enter a valid target number');
        return false;
      }

      if (!unit.trim()) {
        Alert.alert('Error', 'Please enter a unit of measurement');
        return false;
      }

      if (isEditing) {
        const progressNum = parseInt(currentProgress, 10);
        if (isNaN(progressNum) || progressNum < 0) {
          Alert.alert('Error', 'Please enter a valid current progress');
          return false;
        }
      }
    }

    if (showCustomCategory && !customCategory.trim()) {
      Alert.alert('Error', 'Please enter a custom category name or select an existing category');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const finalCategory = showCustomCategory ? customCategory.trim() : selectedCategory;
    const finalCategoryColor = showCustomCategory ? '#6366F1' : selectedCategoryData.color;

    const goalData: Omit<Goal, 'id' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim(),
      type: goalType,
      category: finalCategory,
      customCategory: showCustomCategory ? customCategory.trim() : undefined,
      color: finalCategoryColor,
      deadline,
      isCompleted: false,
      linkedTasks,
    };

    if (goalType === 'quantifiable') {
      const targetNum = parseInt(targetNumber, 10);
      const progressNum = isEditing ? parseInt(currentProgress, 10) : 0;
      
      goalData.targetNumber = targetNum;
      goalData.unit = unit.trim();
      goalData.currentProgress = Math.min(progressNum, targetNum);
      goalData.isCompleted = progressNum >= targetNum;
    } else {
      // For non-quantifiable goals, completion is based on linked tasks
      goalData.isCompleted = false; // Will be calculated based on linked tasks
    }

    onSave(goalData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Goal' : 'Create New Goal'}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel} activeOpacity={0.7}>
          <X size={20} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Goal Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Goal Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you want to achieve?"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Extra notes or personal motivation (optional)"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Goal Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Goal Type *</Text>
          <Text style={styles.helpText}>How do you want to track progress?</Text>
          
          <View style={styles.goalTypeContainer}>
            <TouchableOpacity
              style={[
                styles.goalTypeOption,
                goalType === 'quantifiable' && styles.goalTypeOptionSelected
              ]}
              onPress={() => setGoalType('quantifiable')}
              activeOpacity={0.7}
            >
              <View style={styles.goalTypeIconContainer}>
                <Target 
                  size={20} 
                  color={goalType === 'quantifiable' ? '#4F46E5' : '#6B7280'} 
                  strokeWidth={2} 
                />
              </View>
              <View style={styles.goalTypeContent}>
                <Text style={[
                  styles.goalTypeTitle,
                  goalType === 'quantifiable' && styles.goalTypeTitleSelected
                ]}>
                  Quantifiable
                </Text>
                <Text style={styles.goalTypeDescription}>
                  Track progress with measurable numbers
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.goalTypeOption,
                goalType === 'non-quantifiable' && styles.goalTypeOptionSelected
              ]}
              onPress={() => setGoalType('non-quantifiable')}
              activeOpacity={0.7}
            >
              <View style={styles.goalTypeIconContainer}>
                <CheckSquare 
                  size={20} 
                  color={goalType === 'non-quantifiable' ? '#4F46E5' : '#6B7280'} 
                  strokeWidth={2} 
                />
              </View>
              <View style={styles.goalTypeContent}>
                <Text style={[
                  styles.goalTypeTitle,
                  goalType === 'non-quantifiable' && styles.goalTypeTitleSelected
                ]}>
                  Task-Based
                </Text>
                <Text style={styles.goalTypeDescription}>
                  Progress based on completion of linked tasks
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quantifiable Goal Fields */}
        {goalType === 'quantifiable' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Target Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="How much?"
                placeholderTextColor="#9CA3AF"
                value={targetNumber}
                onChangeText={setTargetNumber}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Unit *</Text>
              <TextInput
                style={styles.input}
                placeholder="What is being measured?"
                placeholderTextColor="#9CA3AF"
                value={unit}
                onChangeText={setUnit}
              />
            </View>

            {isEditing && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Current Progress</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Current progress"
                  placeholderTextColor="#9CA3AF"
                  value={currentProgress}
                  onChangeText={setCurrentProgress}
                  keyboardType="numeric"
                />
              </View>
            )}
          </>
        )}

        {/* Non-Quantifiable Goal Info */}
        {goalType === 'non-quantifiable' && (
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <CheckSquare size={16} color="#6B7280" strokeWidth={2} />
              <Text style={styles.infoText}>
                Progress will be calculated based on linked tasks from your Task Page. 
                You can link tasks to this goal after creation.
              </Text>
            </View>
          </View>
        )}

        {/* Deadline */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Deadline</Text>
          {deadline ? (
            <View style={styles.deadlineContainer}>
              <View style={styles.deadlineDisplay}>
                <Calendar size={16} color="#4F46E5" strokeWidth={2} />
                <Text style={styles.deadlineText}>{formatDate(deadline)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deadlineAction}
                onPress={clearDeadline}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color="#EF4444" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.deadlineButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Calendar size={16} color="#6B7280" strokeWidth={2} />
              <Text style={styles.deadlineButtonText}>Set deadline (optional)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          
          {showCustomCategory ? (
            <View style={styles.customCategoryContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter custom category"
                placeholderTextColor="#9CA3AF"
                value={customCategory}
                onChangeText={setCustomCategory}
                autoFocus
              />
              <TouchableOpacity
                style={styles.customCategoryButton}
                onPress={handleCustomCategoryAdd}
                activeOpacity={0.7}
              >
                <Plus size={16} color="#4F46E5" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customCategoryCancelButton}
                onPress={() => {
                  setShowCustomCategory(false);
                  setCustomCategory('');
                  setSelectedCategory(DEFAULT_CATEGORIES[0].name);
                }}
                activeOpacity={0.7}
              >
                <X size={16} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {allCategories.map((category) => (
                <TouchableOpacity
                  key={category.name}
                  style={[
                    styles.categoryOption,
                    { backgroundColor: category.color + '20' },
                    selectedCategory === category.name && styles.selectedCategoryOption
                  ]}
                  onPress={() => handleCategorySelect(category.name)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    { color: category.color },
                    selectedCategory === category.name && styles.selectedCategoryText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Update Goal' : 'Create Goal'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateSelect}
        currentDate={deadline}
      />
    </SafeAreaView>
  );
}

function DatePickerModal({ 
  visible, 
  onClose, 
  onDateSelect, 
  currentDate 
}: {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  currentDate: Date | null;
}) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(currentDate || today);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(currentDate?.getFullYear() || today.getFullYear(), currentDate?.getMonth() || today.getMonth(), 1)
  );

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
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date: Date | null) => {
    if (!date) return false;
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateOnly < todayOnly;
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    onDateSelect(selectedDate);
  };

  const goToToday = () => {
    const todayDate = new Date();
    setSelectedDate(todayDate);
    setCurrentMonth(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerContainer}>
          {/* Header */}
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Select Deadline</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Calendar Navigation */}
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

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.todayButton}
              onPress={goToToday}
              activeOpacity={0.8}
            >
              <Text style={styles.todayButtonText}>Go to Today</Text>
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
            {days.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !date && styles.emptyCell,
                  isToday(date) && styles.todayCell,
                  isSelected(date) && styles.selectedCell,
                  isPastDate(date) && styles.pastDateCell,
                ]}
                onPress={() => date && !isPastDate(date) && handleDatePress(date)}
                disabled={!date || isPastDate(date)}
                activeOpacity={0.7}
              >
                {date && (
                  <Text style={[
                    styles.dayText,
                    isToday(date) && styles.todayText,
                    isSelected(date) && styles.selectedText,
                    isPastDate(date) && styles.pastDateText,
                  ]}>
                    {date.getDate()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Date Display */}
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateLabel}>Selected Deadline</Text>
            <Text style={styles.selectedDateText}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.datePickerActions}>
            <TouchableOpacity
              style={styles.datePickerCancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.datePickerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerConfirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.datePickerConfirmText}>Set Deadline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  section: {
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  goalTypeContainer: {
    gap: 12,
    marginTop: 8,
  },
  goalTypeOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  goalTypeOptionSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  goalTypeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  goalTypeContent: {
    flex: 1,
  },
  goalTypeTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  goalTypeTitleSelected: {
    color: '#4F46E5',
  },
  goalTypeDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#0369A1',
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deadlineDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deadlineText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 8,
  },
  deadlineAction: {
    padding: 4,
  },
  deadlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deadlineButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  customCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customCategoryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  customCategoryCancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryScroll: {
    marginTop: 4,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategoryOption: {
    borderColor: '#4F46E5',
  },
  categoryOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedCategoryText: {
    color: '#4F46E5',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Date Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  datePickerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  quickActions: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  todayButton: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  todayButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    paddingVertical: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  emptyCell: {
    opacity: 0,
  },
  todayCell: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  selectedCell: {
    backgroundColor: '#4F46E5',
  },
  pastDateCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  todayText: {
    color: '#F59E0B',
    fontFamily: 'Inter-SemiBold',
  },
  selectedText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  pastDateText: {
    color: '#9CA3AF',
  },
  selectedDateContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedDateLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedDateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  datePickerActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  datePickerCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  datePickerCancelText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  datePickerConfirmButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  datePickerConfirmText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});