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
import { X, Target, CheckSquare, Clock, Calendar, ChevronDown } from 'lucide-react-native';
import type { Habit } from '@/app/(tabs)/habits';

interface HabitFormProps {
  habit: Habit | null;
  onSave: (habitData: Omit<Habit, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  isEditing: boolean;
  availableColors: string[];
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Once per week' },
  { value: 'custom', label: 'Custom', description: 'Specific days' },
];

const WEEKDAYS = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
];

export default function HabitForm({ habit, onSave, onCancel, isEditing, availableColors }: HabitFormProps) {
  // Basic fields
  const [name, setName] = useState(habit?.name || '');
  const [type, setType] = useState<'yes_no' | 'measurable'>(habit?.type || 'yes_no');
  const [targetValue, setTargetValue] = useState(habit?.target_value?.toString() || '');
  const [unit, setUnit] = useState(habit?.unit || '');
  const [question, setQuestion] = useState(habit?.question || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>(habit?.frequency || 'daily');
  const [customDays, setCustomDays] = useState<number[]>(habit?.custom_days || []);
  const [reminderTime, setReminderTime] = useState(habit?.reminder_time || '');
  const [notes, setNotes] = useState(habit?.notes || '');
  const [selectedColor, setSelectedColor] = useState(habit?.color || availableColors[0]);
  
  // UI state
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggleCustomDay = (dayValue: number) => {
    setCustomDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(day => day !== dayValue)
        : [...prev, dayValue].sort()
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return false;
    }

    if (type === 'measurable') {
      const target = parseInt(targetValue, 10);
      if (!targetValue || isNaN(target) || target <= 0) {
        Alert.alert('Error', 'Please enter a valid target value');
        return false;
      }

      if (!unit.trim()) {
        Alert.alert('Error', 'Please enter a unit of measurement');
        return false;
      }
    }

    if (frequency === 'custom' && customDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for custom frequency');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const habitData: Omit<Habit, 'id' | 'created_at'> = {
      name: name.trim(),
      type,
      question: question.trim() || undefined,
      frequency,
      custom_days: frequency === 'custom' ? customDays : undefined,
      reminder_time: reminderTime || undefined,
      notes: notes.trim() || undefined,
      color: selectedColor,
      archived: false,
    };

    if (type === 'measurable') {
      habitData.target_value = parseInt(targetValue, 10);
      habitData.unit = unit.trim();
    }

    onSave(habitData);
  };

  const handleTimeSelection = (time: string) => {
    setReminderTime(time);
    setShowTimePicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Habit' : 'Create New Habit'}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel} activeOpacity={0.7}>
          <X size={20} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Habit Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Habit Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="What habit do you want to build?"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        {/* Habit Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Habit Type *</Text>
          <Text style={styles.helpText}>How do you want to track this habit?</Text>
          
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                type === 'yes_no' && styles.typeOptionSelected
              ]}
              onPress={() => setType('yes_no')}
              activeOpacity={0.7}
            >
              <CheckSquare 
                size={20} 
                color={type === 'yes_no' ? '#4F46E5' : '#6B7280'} 
                strokeWidth={2} 
              />
              <View style={styles.typeContent}>
                <Text style={[
                  styles.typeTitle,
                  type === 'yes_no' && styles.typeTitleSelected
                ]}>
                  Yes/No
                </Text>
                <Text style={styles.typeDescription}>
                  Simple completion tracking
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                type === 'measurable' && styles.typeOptionSelected
              ]}
              onPress={() => setType('measurable')}
              activeOpacity={0.7}
            >
              <Target 
                size={20} 
                color={type === 'measurable' ? '#4F46E5' : '#6B7280'} 
                strokeWidth={2} 
              />
              <View style={styles.typeContent}>
                <Text style={[
                  styles.typeTitle,
                  type === 'measurable' && styles.typeTitleSelected
                ]}>
                  Measurable
                </Text>
                <Text style={styles.typeDescription}>
                  Track specific amounts or numbers
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Measurable Fields */}
        {type === 'measurable' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Target Value *</Text>
              <TextInput
                style={styles.input}
                placeholder="How much?"
                placeholderTextColor="#9CA3AF"
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Unit *</Text>
              <TextInput
                style={styles.input}
                placeholder="minutes, pages, glasses, etc."
                placeholderTextColor="#9CA3AF"
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </>
        )}

        {/* Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Frequency *</Text>
          <Text style={styles.helpText}>How often do you want to do this habit?</Text>
          
          <View style={styles.frequencyContainer}>
            {FREQUENCY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyOption,
                  frequency === option.value && styles.frequencyOptionSelected
                ]}
                onPress={() => setFrequency(option.value as any)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.frequencyLabel,
                  frequency === option.value && styles.frequencyLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.frequencyDescription}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Days */}
        {frequency === 'custom' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Days *</Text>
            <View style={styles.weekdaysContainer}>
              {WEEKDAYS.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.weekdayOption,
                    customDays.includes(day.value) && styles.weekdayOptionSelected
                  ]}
                  onPress={() => toggleCustomDay(day.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.weekdayText,
                    customDays.includes(day.value) && styles.weekdayTextSelected
                  ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Question */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Motivational Question</Text>
          <Text style={styles.helpText}>Optional question to remind you why this habit matters</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Why is this habit important to you?"
            placeholderTextColor="#9CA3AF"
            value={question}
            onChangeText={setQuestion}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* Reminder Time */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Reminder Time</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}
          >
            <Clock size={16} color="#6B7280" strokeWidth={2} />
            <Text style={[
              styles.timeButtonText,
              !reminderTime && styles.placeholderText
            ]}>
              {reminderTime || 'Set reminder time (optional)'}
            </Text>
            <ChevronDown size={16} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
            {availableColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorOption
                ]}
                onPress={() => setSelectedColor(color)}
                activeOpacity={0.8}
              />
            ))}
          </ScrollView>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional notes about this habit..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
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
            {isEditing ? 'Update Habit' : 'Create Habit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
      <SimpleTimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onTimeSelect={handleTimeSelection}
        currentTime={reminderTime}
      />
    </SafeAreaView>
  );
}

function SimpleTimePickerModal({ 
  visible, 
  onClose, 
  onTimeSelect, 
  currentTime 
}: {
  visible: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
  currentTime: string;
}) {
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  // Parse current time on modal open
  React.useEffect(() => {
    if (visible && currentTime) {
      const [time, period] = currentTime.split(' ');
      const [hour, minute] = time.split(':').map(Number);
      
      setSelectedHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour);
      setSelectedMinute(minute);
      setSelectedPeriod(period as 'AM' | 'PM');
    }
  }, [visible, currentTime]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 15, 30, 45];

  const handleConfirm = () => {
    let hour24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour !== 12) {
      hour24 += 12;
    } else if (selectedPeriod === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }

    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
    onTimeSelect(timeString);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerHeader}>
            <Text style={styles.timePickerTitle}>Set Reminder Time</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.timeSelectorsContainer}>
            {/* Hours */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnLabel}>Hour</Text>
              <ScrollView style={styles.timeScrollView} showsVerticalScrollIndicator={false}>
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.timeOption,
                      selectedHour === hour && styles.selectedTimeOption
                    ]}
                    onPress={() => setSelectedHour(hour)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      selectedHour === hour && styles.selectedTimeOptionText
                    ]}>
                      {hour}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minutes */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnLabel}>Minute</Text>
              <ScrollView style={styles.timeScrollView} showsVerticalScrollIndicator={false}>
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.timeOption,
                      selectedMinute === minute && styles.selectedTimeOption
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      selectedMinute === minute && styles.selectedTimeOptionText
                    ]}>
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* AM/PM */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnLabel}>Period</Text>
              <View style={styles.periodContainer}>
                {['AM', 'PM'].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.timeOption,
                      selectedPeriod === period && styles.selectedTimeOption
                    ]}
                    onPress={() => setSelectedPeriod(period as 'AM' | 'PM')}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      selectedPeriod === period && styles.selectedTimeOptionText
                    ]}>
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.timePickerActions}>
            <TouchableOpacity
              style={styles.timePickerCancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.timePickerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timePickerConfirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.timePickerConfirmText}>Set Time</Text>
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
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
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
  typeContainer: {
    gap: 12,
    marginTop: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  typeOptionSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  typeContent: {
    flex: 1,
    marginLeft: 12,
  },
  typeTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  typeTitleSelected: {
    color: '#4F46E5',
  },
  typeDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  frequencyContainer: {
    gap: 8,
    marginTop: 8,
  },
  frequencyOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  frequencyOptionSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  frequencyLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  frequencyLabelSelected: {
    color: '#4F46E5',
  },
  frequencyDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  weekdayOption: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  weekdayOptionSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  weekdayText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  weekdayTextSelected: {
    color: '#4F46E5',
  },
  timeButton: {
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
  timeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  colorScroll: {
    marginTop: 8,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  // Time Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timePickerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  timeSelectorsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: 200,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  timeColumnLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeScrollView: {
    maxHeight: 150,
    width: '100%',
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  selectedTimeOption: {
    backgroundColor: '#4F46E5',
  },
  timeOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  selectedTimeOptionText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  periodContainer: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  timePickerActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timePickerCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  timePickerCancelText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  timePickerConfirmButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  timePickerConfirmText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});