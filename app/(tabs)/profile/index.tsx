import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, Star, Award, TrendingUp, ChevronRight, CreditCard as Edit3, LogOut, Database, Gem, Info, ListChecks, CircleCheck as CheckCircle2, Target } from 'lucide-react-native';
import { router } from 'expo-router';
import { habitStorage } from '@/utils/habitStorage';

interface ProfileStat {
  label: string;
  value: string;
  color: string;
  icon: any;
}

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  color: string;
  showChevron?: boolean;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const [habitStats, setHabitStats] = useState({
    activeHabits: 0,
    totalCompletions: 0,
    tasksCompleted: 127,
    goalsAchieved: 8,
    streakDays: 23,
  });

  useEffect(() => {
    loadHabitStatistics();
  }, []);

  const loadHabitStatistics = async () => {
    try {
      const habits = await habitStorage.getHabits();
      const activeHabits = habits.filter(h => h.isActive);
      
      let totalCompletions = 0;
      for (const habit of activeHabits) {
        const stats = await habitStorage.calculateHabitStats(habit.id);
        totalCompletions += stats.totalCompletions;
      }

      setHabitStats(prev => ({
        ...prev,
        activeHabits: activeHabits.length,
        totalCompletions,
      }));
    } catch (error) {
      console.error('Error loading habit statistics:', error);
    }
  };

  const stats: ProfileStat[] = [
    {
      label: 'Tasks Completed',
      value: habitStats.tasksCompleted.toString(),
      color: '#4F46E5',
      icon: Award,
    },
    {
      label: 'Active Habits',
      value: habitStats.activeHabits.toString(),
      color: '#8B5CF6',
      icon: ListChecks,
    },
    {
      label: 'Habit Completions',
      value: habitStats.totalCompletions.toString(),
      color: '#10B981',
      icon: CheckCircle2,
    },
    {
      label: 'Goals Achieved',
      value: habitStats.goalsAchieved.toString(),
      color: '#F59E0B',
      icon: Target,
    },
  ];

  const menuItems: MenuItem[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your alerts and reminders',
      icon: Bell,
      color: '#4F46E5',
      showChevron: true,
    },
    {
      id: 'data-sync',
      title: 'Data & Sync',
      subtitle: 'Export data and manage archived habits',
      icon: Database,
      color: '#06B6D4',
      showChevron: true,
      onPress: () => router.push('/profile/data-sync'),
    },
    {
      id: 'premium',
      title: 'Premium Features',
      subtitle: 'Unlock advanced features and analytics',
      icon: Gem,
      color: '#8B5CF6',
      showChevron: true,
      onPress: () => router.push('/profile/premium'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Control your data and privacy settings',
      icon: Shield,
      color: '#10B981',
      showChevron: true,
    },
    {
      id: 'settings',
      title: 'App Settings',
      subtitle: 'Customize your app experience',
      icon: Settings,
      color: '#F59E0B',
      showChevron: true,
    },
    {
      id: 'about',
      title: 'About DoFive',
      subtitle: 'App information and legal',
      icon: Info,
      color: '#6B7280',
      showChevron: true,
      onPress: () => router.push('/profile/about'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: HelpCircle,
      color: '#EF4444',
      showChevron: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&dpr=2' }}
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
                <Edit3 size={14} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Alex Johnson</Text>
              <Text style={styles.profileEmail}>alex.johnson@email.com</Text>
              <Text style={styles.memberSince}>Member since January 2024</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                    <IconComponent size={16} color={stat.color} strokeWidth={2} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Achievement Banner */}
        <View style={styles.achievementBanner}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400&h=120&dpr=2' }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Star size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.bannerTitle}>Productivity Master!</Text>
            <Text style={styles.bannerText}>
              You've completed {habitStats.tasksCompleted} tasks and {habitStats.totalCompletions} habits this month
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <IconComponent size={18} color={item.color} strokeWidth={2} />
                </View>
                
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
                
                {item.showChevron && (
                  <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8}>
          <LogOut size={18} color="#EF4444" strokeWidth={2} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  achievementBanner: {
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(79, 70, 229, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  bannerTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 2,
  },
  bannerText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 1,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 6,
  },
});