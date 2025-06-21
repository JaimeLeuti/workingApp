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
  Modal,
} from 'react-native';
import { Plus, X, Clock, Calendar, Trash2, ChevronDown } from 'lucide-react-native';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface ComplexTaskFormProps {
  onSave: (taskData: {
    title: string;
    description: string;
    subtasks: Subtask[];
    startTime: Date | null;
    duration: number;
  }) => void;
  onCancel: () => void;
}

export default function ComplexTaskForm({ onSave, onCancel }: ComplexTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a subtask title');
      return;
    }

    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    setSubtasks(prev => [...prev, newSubtask]);
    setNewSubtaskTitle('');
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks(prev => prev.filter(subtask => subtask.id !== subtaskId));
  };

  const handleTimeSelection = (hour: number, minute: number, period: 'AM' | 'PM') => {
    const now = new Date();
    let adjustedHour = hour;
    
    if (period === 'PM' && hour !== 12) {
      adjustedHour = hour + 12;
    } else if (period === 'AM' && hour === 12) {
      adjustedHour = 0;
    }
    
    const selectedTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), adjustedHour, minute);
    setStartTime(selectedTime);
    setShowTimePicker(false);
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Select start time';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const durationMinutes = duration ? parseInt(duration, 10) : 0;
    if (duration && (isNaN(durationMinutes) || durationMinutes <= 0)) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      subtasks,
      startTime,
      duration: durationMinutes,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Complex Task</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel} activeOpacity={0.7}>
            <X size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Task Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Task Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter task title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Task Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add task description (optional)"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Start Time */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Start Time</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}
          >
            <Clock size={16} color="#6B7280" strokeWidth={2} />
            <Text style={[styles.timeButtonText, !startTime && styles.placeholderText]}>
              {formatDateTime(startTime)}
            </Text>
            <ChevronDown size={16} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Duration (minutes)</Text>
          <View style={styles.durationContainer}>
            <Clock size={16} color="#6B7280" strokeWidth={2} />
            <TextInput
              style={styles.durationInput}
              placeholder="30"
              placeholderTextColor="#9CA3AF"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
            <Text style={styles.durationUnit}>min</Text>
          </View>
        </View>

        {/* Subtasks */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Subtasks ({subtasks.length})</Text>
          
          {/* Add Subtask Input */}
          <View style={styles.addSubtaskContainer}>
            <TextInput
              style={styles.subtaskInput}
              placeholder="Add a subtask"
              placeholderTextColor="#9CA3AF"
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              onSubmitEditing={addSubtask}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addSubtaskButton}
              onPress={addSubtask}
              activeOpacity={0.7}
            >
              <Plus size={16} color="#4F46E5" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Subtasks List */}
          {subtasks.map((subtask) => (
            <View key={subtask.id} style={styles.subtaskItem}>
              <View style={styles.subtaskContent}>
                <View style={styles.subtaskBullet} />
                <Text style={styles.subtaskTitle}>{subtask.title}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeSubtaskButton}
                onPress={() => removeSubtask(subtask.id)}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color="#EF4444" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelActionButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelActionButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveActionButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveActionButtonText}>Create Task</Text>
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onTimeSelect={handleTimeSelection}
        currentTime={startTime}
      />
    </View>
  );
}

function TimePickerModal({ 
  visible, 
  onClose, 
  onTimeSelect, 
  currentTime 
}: {
  visible: boolean;
  onClose: () => void;
  onTimeSelect: (hour: number, minute: number, period: 'AM' | 'PM') => void;
  currentTime: Date | null;
}) {
  const [selectedHour, setSelectedHour] = useState(currentTime ? currentTime.getHours() % 12 || 12 : 9);
  const [selectedMinute, setSelectedMinute] = useState(currentTime ? currentTime.getMinutes() : 0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(
    currentTime ? (currentTime.getHours() >= 12 ? 'PM' : 'AM') : 'AM'
  );

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleConfirm = () => {
    onTimeSelect(selectedHour, selectedMinute, selectedPeriod);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerHeader}>
            <Text style={styles.timePickerTitle}>Select Time</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.timePickerContent}>
            {/* Hour Selector */}
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
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minute Selector */}
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

            {/* Period Selector */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnLabel}>Period</Text>
              <View style={styles.periodContainer}>
                {['AM', 'PM'].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodOption,
                      selectedPeriod === period && styles.selectedPeriodOption
                    ]}
                    onPress={() => setSelectedPeriod(period as 'AM' | 'PM')}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.periodOptionText,
                      selectedPeriod === period && styles.selectedPeriodOptionText
                    ]}>
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Selected Time Display */}
          <View style={styles.selectedTimeDisplay}>
            <Text style={styles.selectedTimeText}>
              {selectedHour.toString().padStart(2, '0')}:
              {selectedMinute.toString().padStart(2, '0')} {selectedPeriod}
            </Text>
          </View>

          {/* Action Buttons */}
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
              <Text style={styles.timePickerConfirmText}>Confirm</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  titleInput: {
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
  descriptionInput: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
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
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  durationInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 8,
  },
  durationUnit: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    paddingVertical: 4,
  },
  addSubtaskButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 6,
  },
  subtaskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subtaskBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginRight: 10,
  },
  subtaskTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  removeSubtaskButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelActionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelActionButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  saveActionButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveActionButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Time Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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
  timePickerContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeColumnLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeScrollView: {
    maxHeight: 120,
    width: '100%',
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
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
  },
  periodOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  selectedPeriodOption: {
    backgroundColor: '#4F46E5',
  },
  periodOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  selectedPeriodOptionText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  selectedTimeDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedTimeText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
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
    paddingVertical: 12,
    borderRadius: 8,
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timePickerConfirmText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});