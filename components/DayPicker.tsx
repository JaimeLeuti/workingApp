import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface DayPickerProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
}

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function DayPicker({ selectedDays, onDaysChange }: DayPickerProps) {
  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      onDaysChange(selectedDays.filter(day => day !== dayValue));
    } else {
      onDaysChange([...selectedDays, dayValue].sort());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Days</Text>
      <View style={styles.daysContainer}>
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <TouchableOpacity
              key={day.value}
              style={[
                styles.dayButton,
                isSelected && styles.selectedDayButton
              ]}
              onPress={() => toggleDay(day.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.selectedDayText
              ]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selectedDays.length === 0 && (
        <Text style={styles.errorText}>Please select at least one day</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedDayButton: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    marginTop: 4,
  },
});