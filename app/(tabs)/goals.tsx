import React, { useState } from 'react';
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
import { Target, Plus, ChevronRight, Calendar, Check, Trash2, CreditCard as Edit3, X } from 'lucide-react-native';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  category: string;
  color: string;
  dueDate: string;
  isCompleted: boolean;
  createdAt: Date;
}

type ModalState = 'none' | 'create' | 'edit';

const GOAL_CATEGORIES = [
  { name: 'Health', color: '#10B981' },
  { name: 'Learning', color: '#8B5CF6' },
  { name: 'Career', color: '#06B6D4' },
  { name: 'Personal', color: '#F59E0B' },
  { name: 'Finance', color: '#EF4444' },
  { name: 'Fitness', color: '#84CC16' },
];

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalState, setModalState] = useState<ModalState>('none');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const openCreateModal = () => {
    setEditingGoal(null);
    setModalState('create');
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setModalState('edit');
  };

  const closeModal = () => {
    setModalState('none');
    setEditingGoal(null);
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (editingGoal) {
      // Update existing goal
      setGoals(prev => prev.map(goal => 
        goal.id === editingGoal.id 
          ? { ...goalData, id: editingGoal.id, createdAt: editingGoal.createdAt }
          : goal
      ));
    } else {
      // Create new goal
      const newGoal: Goal = {
        ...goalData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      setGoals(prev => [...prev, newGoal]);
    }
    closeModal();
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setGoals(prev => prev.filter(goal => goal.id !== goalId))
        },
      ]
    );
  };

  const handleProgressUpdate = (goalId: string, newProgress: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedProgress = Math.max(0, Math.min(newProgress, goal.target));
        return {
          ...goal,
          progress: updatedProgress,
          isCompleted: updatedProgress >= goal.target
        };
      }
      return goal;
    }));
  };

  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Goals</Text>
              <Text style={styles.headerSubtitle}>Track your progress</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={openCreateModal}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Target size={32} color="#9CA3AF" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first goal to start tracking your progress
            </Text>
            <TouchableOpacity 
              style={styles.emptyActionButton}
              onPress={openCreateModal}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.emptyActionButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Active Goals Section */}
            {activeGoals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Active Goals</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{activeGoals.length}</Text>
                  </View>
                </View>

                {activeGoals.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onEdit={() => openEditModal(goal)}
                    onDelete={() => handleDeleteGoal(goal.id)}
                    onProgressUpdate={(newProgress) => handleProgressUpdate(goal.id, newProgress)}
                  />
                ))}
              </View>
            )}

            {/* Completed Goals Section */}
            {completedGoals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Completed Goals</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{completedGoals.length}</Text>
                  </View>
                </View>

                {completedGoals.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onEdit={() => openEditModal(goal)}
                    onDelete={() => handleDeleteGoal(goal.id)}
                    onProgressUpdate={(newProgress) => handleProgressUpdate(goal.id, newProgress)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Goal Form Modal */}
      <Modal
        visible={modalState !== 'none'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <GoalForm
          goal={editingGoal}
          onSave={handleSaveGoal}
          onCancel={closeModal}
          isEditing={modalState === 'edit'}
        />
      </Modal>
    </SafeAreaView>
  );
}

function GoalCard({ 
  goal, 
  onEdit, 
  onDelete, 
  onProgressUpdate 
}: { 
  goal: Goal; 
  onEdit: () => void;
  onDelete: () => void;
  onProgressUpdate: (newProgress: number) => void;
}) {
  const progressPercentage = (goal.progress / goal.target) * 100;
  
  const incrementProgress = () => {
    onProgressUpdate(goal.progress + 1);
  };

  const decrementProgress = () => {
    onProgressUpdate(goal.progress - 1);
  };

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={[styles.goalColorIndicator, { backgroundColor: goal.color }]} />
        <View style={styles.goalInfo}>
          <Text style={[styles.goalTitle, goal.isCompleted && styles.completedText]}>
            {goal.title}
          </Text>
          <Text style={styles.goalDescription}>{goal.description}</Text>
        </View>
        <View style={styles.goalActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <Edit3 size={16} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color="#EF4444" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.goalProgress}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {goal.progress} of {goal.target}
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(progressPercentage, 100)}%`,
                backgroundColor: goal.color 
              }
            ]} 
          />
        </View>

        {/* Progress Controls */}
        {!goal.isCompleted && (
          <View style={styles.progressControls}>
            <TouchableOpacity
              style={[styles.progressButton, goal.progress <= 0 && styles.progressButtonDisabled]}
              onPress={decrementProgress}
              disabled={goal.progress <= 0}
              activeOpacity={0.7}
            >
              <Text style={styles.progressButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.progressButton, goal.progress >= goal.target && styles.progressButtonDisabled]}
              onPress={incrementProgress}
              disabled={goal.progress >= goal.target}
              activeOpacity={0.7}
            >
              <Text style={styles.progressButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.goalFooter}>
        <View style={[styles.categoryBadge, { backgroundColor: goal.color + '20' }]}>
          <Text style={[styles.categoryText, { color: goal.color }]}>
            {goal.category}
          </Text>
        </View>
        
        <View style={styles.dueDateContainer}>
          <Calendar size={12} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.dueDate}>{goal.dueDate}</Text>
        </View>

        {goal.isCompleted && (
          <View style={styles.completedBadge}>
            <Check size={12} color="#10B981" strokeWidth={2} />
            <Text style={styles.completedBadgeText}>Completed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function GoalForm({ 
  goal, 
  onSave, 
  onCancel, 
  isEditing 
}: {
  goal: Goal | null;
  onSave: (goalData: Omit<Goal, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [target, setTarget] = useState(goal?.target.toString() || '');
  const [progress, setProgress] = useState(goal?.progress.toString() || '0');
  const [selectedCategory, setSelectedCategory] = useState(
    goal?.category || GOAL_CATEGORIES[0].name
  );
  const [dueDate, setDueDate] = useState(goal?.dueDate || 'Dec 31, 2024');

  const selectedCategoryData = GOAL_CATEGORIES.find(cat => cat.name === selectedCategory) || GOAL_CATEGORIES[0];

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    const targetNumber = parseInt(target, 10);
    const progressNumber = parseInt(progress, 10);

    if (isNaN(targetNumber) || targetNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid target number');
      return;
    }

    if (isNaN(progressNumber) || progressNumber < 0) {
      Alert.alert('Error', 'Please enter a valid progress number');
      return;
    }

    const goalData = {
      title: title.trim(),
      description: description.trim(),
      target: targetNumber,
      progress: Math.min(progressNumber, targetNumber),
      category: selectedCategory,
      color: selectedCategoryData.color,
      dueDate,
      isCompleted: progressNumber >= targetNumber,
    };

    onSave(goalData);
  };

  return (
    <SafeAreaView style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          {isEditing ? 'Edit Goal' : 'Create New Goal'}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel} activeOpacity={0.7}>
          <X size={20} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Goal Title *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter goal title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Description */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            placeholder="Describe your goal (optional)"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Target */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Target *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter target number"
            placeholderTextColor="#9CA3AF"
            value={target}
            onChangeText={setTarget}
            keyboardType="numeric"
          />
        </View>

        {/* Progress (only show when editing) */}
        {isEditing && (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Current Progress</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter current progress"
              placeholderTextColor="#9CA3AF"
              value={progress}
              onChangeText={setProgress}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Category */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {GOAL_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryOption,
                  { backgroundColor: category.color + '20' },
                  selectedCategory === category.name && styles.selectedCategoryOption
                ]}
                onPress={() => setSelectedCategory(category.name)}
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
        </View>

        {/* Due Date */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Due Date</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter due date"
            placeholderTextColor="#9CA3AF"
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.formCancelButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.formCancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.formSaveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.formSaveButtonText}>
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
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  sectionBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalColorIndicator: {
    width: 3,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  goalDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 18,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  goalProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  progressButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  progressButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginLeft: 4,
  },
  // Form Styles
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  formTitle: {
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
  formContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    paddingVertical: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
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
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  formActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  formCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  formCancelButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  formSaveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  formSaveButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});