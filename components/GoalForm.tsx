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
} from 'react-native';
import { X, Target, SquareCheck as CheckSquare, Calendar, Plus, Trash2 } from 'lucide-react-native';

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

  const handleDateSelect = () => {
    // For now, set a default date. In a real app, you'd open a date picker
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3); // 3 months from now
    setDeadline(futureDate);
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
              onPress={handleDateSelect}
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
});