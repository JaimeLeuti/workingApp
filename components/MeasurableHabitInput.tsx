import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Target, Plus, Minus } from 'lucide-react-native';
import type { Habit } from '@/app/(tabs)/habits';

interface MeasurableHabitInputProps {
  habit: Habit;
  currentValue: number;
  onSave: (value: number) => void;
  onCancel: () => void;
}

export default function MeasurableHabitInput({ 
  habit, 
  currentValue, 
  onSave, 
  onCancel 
}: MeasurableHabitInputProps) {
  const [value, setValue] = useState(currentValue.toString());

  const handleSave = () => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue < 0) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    onSave(numValue);
  };

  const adjustValue = (adjustment: number) => {
    const currentNum = parseFloat(value) || 0;
    const newValue = Math.max(0, currentNum + adjustment);
    setValue(newValue.toString());
  };

  const getProgressPercentage = () => {
    const numValue = parseFloat(value) || 0;
    const target = habit.target_value || 1;
    return Math.min((numValue / target) * 100, 100);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Target size={20} color={habit.color} strokeWidth={2} />
          </View>
          <Text style={styles.title}>{habit.name}</Text>
          <Text style={styles.subtitle}>
            Target: {habit.target_value} {habit.unit}
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>How much did you complete?</Text>
          
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => adjustValue(-1)}
              activeOpacity={0.7}
            >
              <Minus size={16} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              selectTextOnFocus
            />
            
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => adjustValue(1)}
              activeOpacity={0.7}
            >
              <Plus size={16} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={styles.unitLabel}>{habit.unit}</Text>
        </View>

        {/* Progress Visualization */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {value || 0} / {habit.target_value} {habit.unit}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(getProgressPercentage())}%
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: habit.color 
                }
              ]} 
            />
          </View>

          {getProgressPercentage() >= 100 && (
            <Text style={styles.completedText}>🎉 Target reached!</Text>
          )}
        </View>

        {/* Quick Values */}
        {habit.target_value && (
          <View style={styles.quickValues}>
            <Text style={styles.quickValuesLabel}>Quick values:</Text>
            <View style={styles.quickValuesContainer}>
              {[
                Math.round(habit.target_value * 0.25),
                Math.round(habit.target_value * 0.5),
                Math.round(habit.target_value * 0.75),
                habit.target_value
              ].map((quickValue) => (
                <TouchableOpacity
                  key={quickValue}
                  style={[
                    styles.quickValueButton,
                    parseInt(value) === quickValue && styles.quickValueButtonSelected
                  ]}
                  onPress={() => setValue(quickValue.toString())}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.quickValueText,
                    parseInt(value) === quickValue && styles.quickValueTextSelected
                  ]}>
                    {quickValue}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: habit.color }]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  inputSection: {
    padding: 20,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  adjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 100,
  },
  unitLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completedText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    textAlign: 'center',
  },
  quickValues: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickValuesLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickValuesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  quickValueButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickValueButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  quickValueText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  quickValueTextSelected: {
    color: '#4F46E5',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
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
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});