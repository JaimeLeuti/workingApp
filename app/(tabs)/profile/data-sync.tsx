import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { 
  ArrowLeft, 
  Download, 
  Upload, 
  Archive, 
  RotateCcw,
  Database,
  FileText,
  Calendar,
  Target,
  CheckSquare
} from 'lucide-react-native';
import { router } from 'expo-router';
import { habitStorage } from '@/utils/habitStorage';
import { Habit } from '@/types/habit';

export default function DataSyncScreen() {
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArchivedHabits();
  }, []);

  const loadArchivedHabits = async () => {
    try {
      setLoading(true);
      const habits = await habitStorage.getHabits();
      const archived = habits.filter(h => !h.isActive);
      setArchivedHabits(archived);
    } catch (error) {
      console.error('Error loading archived habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature will export all your tasks, goals, and habits data to a JSON file. This functionality requires a development build to access the file system.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: exportData },
      ]
    );
  };

  const exportData = async () => {
    try {
      // In a real implementation, this would export data to a file
      // For now, we'll show a placeholder
      Alert.alert(
        'Export Complete',
        'Your data has been prepared for export. In a production app, this would save to your device or cloud storage.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleReactivateHabit = async (habit: Habit) => {
    try {
      const updatedHabit = { ...habit, isActive: true };
      await habitStorage.saveHabit(updatedHabit);
      
      // Remove from archived list
      setArchivedHabits(prev => prev.filter(h => h.id !== habit.id));
      
      Alert.alert('Success', `${habit.name} has been reactivated and will appear in your habits list.`);
    } catch (error) {
      console.error('Error reactivating habit:', error);
      Alert.alert('Error', 'Failed to reactivate habit. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
        
        <Text style={styles.headerTitle}>Data & Sync</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Export Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Data</Text>
          <Text style={styles.sectionDescription}>
            Download all your app data including tasks, goals, and habits for backup or transfer.
          </Text>

          <View style={styles.exportOptions}>
            <TouchableOpacity 
              style={styles.exportOption}
              onPress={handleExportData}
              activeOpacity={0.8}
            >
              <View style={styles.exportOptionIcon}>
                <FileText size={20} color="#4F46E5" strokeWidth={2} />
              </View>
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>Export All Data</Text>
                <Text style={styles.exportOptionDescription}>
                  Complete backup including all tasks, goals, and habits
                </Text>
              </View>
              <Download size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.exportOption}
              onPress={() => Alert.alert('Coming Soon', 'Individual data type exports will be available in a future update.')}
              activeOpacity={0.8}
            >
              <View style={styles.exportOptionIcon}>
                <CheckSquare size={20} color="#10B981" strokeWidth={2} />
              </View>
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>Export Habits Only</Text>
                <Text style={styles.exportOptionDescription}>
                  Just your habits and completion history
                </Text>
              </View>
              <Download size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.exportOption}
              onPress={() => Alert.alert('Coming Soon', 'Individual data type exports will be available in a future update.')}
              activeOpacity={0.8}
            >
              <View style={styles.exportOptionIcon}>
                <Target size={20} color="#F59E0B" strokeWidth={2} />
              </View>
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>Export Goals Only</Text>
                <Text style={styles.exportOptionDescription}>
                  Your goals and progress data
                </Text>
              </View>
              <Download size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Import Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Data</Text>
          <Text style={styles.sectionDescription}>
            Restore data from a previous backup or import from another device.
          </Text>

          <TouchableOpacity 
            style={styles.importButton}
            onPress={() => Alert.alert('Coming Soon', 'Data import functionality will be available in a future update.')}
            activeOpacity={0.8}
          >
            <Upload size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.importButtonText}>Import Data</Text>
          </TouchableOpacity>
        </View>

        {/* Archived Habits Section */}
        <View style={styles.section}>
          <View style={styles.archivedHeader}>
            <Text style={styles.sectionTitle}>Archived Habits</Text>
            <View style={styles.archivedBadge}>
              <Text style={styles.archivedBadgeText}>{archivedHabits.length}</Text>
            </View>
          </View>
          <Text style={styles.sectionDescription}>
            Habits you've archived but want to keep the data for. You can reactivate them anytime.
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading archived habits...</Text>
            </View>
          ) : archivedHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Archive size={32} color="#9CA3AF" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No archived habits</Text>
              <Text style={styles.emptySubtitle}>
                When you archive habits, they'll appear here
              </Text>
            </View>
          ) : (
            <View style={styles.archivedList}>
              {archivedHabits.map((habit) => (
                <View key={habit.id} style={styles.archivedHabitCard}>
                  <View style={styles.archivedHabitInfo}>
                    <View style={[styles.archivedHabitIcon, { backgroundColor: habit.color + '20' }]}>
                      <Text style={[styles.archivedHabitIconText, { color: habit.color }]}>
                        {habit.icon}
                      </Text>
                    </View>
                    <View style={styles.archivedHabitDetails}>
                      <Text style={styles.archivedHabitName}>{habit.name}</Text>
                      <Text style={styles.archivedHabitMeta}>
                        {habit.type === 'boolean' ? 'Yes/No Habit' : 'Measurable Habit'} • 
                        Archived {formatDate(habit.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.reactivateButton}
                    onPress={() => handleReactivateHabit(habit)}
                    activeOpacity={0.7}
                  >
                    <RotateCcw size={16} color="#4F46E5" strokeWidth={2} />
                    <Text style={styles.reactivateButtonText}>Reactivate</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Storage Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage Information</Text>
          <View style={styles.storageInfo}>
            <View style={styles.storageItem}>
              <Database size={16} color="#6B7280" strokeWidth={2} />
              <Text style={styles.storageText}>
                All data is stored locally on your device
              </Text>
            </View>
            <View style={styles.storageItem}>
              <Calendar size={16} color="#6B7280" strokeWidth={2} />
              <Text style={styles.storageText}>
                Regular backups are recommended
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  exportOptions: {
    gap: 12,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  exportOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exportOptionContent: {
    flex: 1,
  },
  exportOptionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  exportOptionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  importButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  archivedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  archivedBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  archivedBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  archivedList: {
    gap: 12,
  },
  archivedHabitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  archivedHabitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  archivedHabitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  archivedHabitIconText: {
    fontSize: 16,
  },
  archivedHabitDetails: {
    flex: 1,
  },
  archivedHabitName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 2,
  },
  archivedHabitMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  reactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  reactivateButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
  },
  storageInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storageText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});