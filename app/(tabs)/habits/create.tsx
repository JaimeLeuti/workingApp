import React from 'react';
import { router } from 'expo-router';
import { Habit } from '@/types/habit';
import { habitStorage } from '@/utils/habitStorage';
import { notificationService } from '@/utils/notificationService';
import HabitForm from '@/components/HabitForm';

export default function CreateHabitScreen() {
  const handleSave = async (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    try {
      const newHabit: Habit = {
        ...habitData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };

      await habitStorage.saveHabit(newHabit);

      // Schedule notification if reminder time is set
      if (newHabit.reminderTime) {
        await notificationService.scheduleHabitReminder(newHabit);
      }

      router.back();
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <HabitForm
      onSave={handleSave}
      onCancel={handleCancel}
      isEditing={false}
    />
  );
}