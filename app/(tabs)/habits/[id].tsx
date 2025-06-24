import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Archive
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Habit } from '@/types/habit';
import { habitStorage } from '@/utils/habitStorage';
import { notificationService } from '@/utils/notificationService';
import HabitStatsView from '@/components/HabitStatsView';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadHabit();
    }
  }, [id]);

  const loadHabit = async () => {
    try {
      setLoading(true);
      const habits = await habitStorage.getHabits();
      const foundHabit = habits.find(h => h.id === id);
      
      if (foundHabit) {
        setHabit(foundHabit);
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error loading habit:', error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/habits/${id}/edit`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This will also delete all associated data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: confirmDelete
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!habit) return;

    try {
      // Cancel any scheduled notifications
      await notificationService.cancelHabitReminder(habit.id);
      
      // Delete the habit and all its data
      await habitStorage.deleteHabit(habit.id);
      
      router.back();
    } catch (error) {
      console.error('Error deleting habit:', error);
      Alert.alert('Error', 'Failed to delete habit. Please try again.');
    }
  };

  const handleArchive = async () => {
    if (!habit) return;

    Alert.alert(
      'Archive Habit',
      'This will stop tracking this habit but keep all your data. You can reactivate it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Archive', 
          onPress: confirmArchive
        },
      ]
    );
  };

  const confirmArchive = async () => {
    if (!habit) return;

    try {
      const updatedHabit = { ...habit, isActive: false };
      await habitStorage.saveHabit(updatedHabit);
      await notificationService.cancelHabitReminder(habit.id);
      
      setHabit(updatedHabit);
    } catch (error) {
      console.error('Error archiving habit:', error);
      Alert.alert('Error', 'Failed to archive habit. Please try again.');
    }
  };

  const handleReactivate = async () => {
    if (!habit) return;

    try {
      const updatedHabit = { ...habit, isActive: true };
      await habitStorage.saveHabit(updatedHabit);
      
      // Reschedule notification if reminder time is set
      if (updatedHabit.reminderTime) {
        await notificationService.sche duleHabitReminder(updatedHabit);
      }
      
      setHabit(updatedHabit);
    } catch (error) {
      console.error('Error reactivating habit:', error);
      Alert.alert('Error', 'Failed to reactivate habit. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading habit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!habit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Habit not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
            <Text style={[styles.habitIconText, { color: habit.color }]}>
              {habit.icon}
            </Text>
          </View>
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.habitType}>
              {habit.type === 'boolean' ? 'Yes/No Habit' : 'Measurable Habit'}
              {!habit.isActive && ' (Archived)'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <Edit3 size={18} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={habit.isActive ? handleArchive : handleReactivate}
            activeOpacity={0.7}
          >
            <Archive size={18} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#EF4444" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Banner */}
      {!habit.isActive && (
        <View style={styles.statusBanner}>
          <Archive size={16} color="#F59E0B" strokeWidth={2} />
          <Text style={styles.statusBannerText}>
            This habit is archived and not being tracked
          </Text>
          <TouchableOpacity
            style={styles.reactivateButton}
            onPress={handleReactivate}
            activeOpacity={0.7}
          >
            <Text style={styles.reactivateButtonText}>Reactivate</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats View */}
      <HabitStatsView habit={habit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  habitIconText: {
    fontSize: 18,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  habitType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
  },
  statusBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#92400E',
    marginLeft: 8,
  },
  reactivateButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reactivateButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
  },
});