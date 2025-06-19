import React, { useState } from 'react';
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
import { 
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Plus,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react-native';

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
}

export default function GoalsScreen() {
  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Read 12 Books This Year',
      description: 'Expand knowledge through consistent reading',
      progress: 8,
      target: 12,
      category: 'Learning',
      color: '#8B5CF6',
      dueDate: 'Dec 31, 2024',
      isCompleted: false,
    },
    {
      id: '2',
      title: 'Exercise 4 Times a Week',
      description: 'Maintain a healthy lifestyle',
      progress: 16,
      target: 20,
      category: 'Health',
      color: '#10B981',
      dueDate: 'Ongoing',
      isCompleted: false,
    },
    {
      id: '3',
      title: 'Learn React Native',
      description: 'Master mobile app development',
      progress: 10,
      target: 10,
      category: 'Career',
      color: '#06B6D4',
      dueDate: 'Nov 30, 2024',
      isCompleted: true,
    },
  ]);

  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const activeGoals = goals.filter(goal => !goal.isCompleted).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Goals</Text>
              <Text style={styles.headerSubtitle}>Track your long-term objectives</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Target size={20} color="#6366F1" strokeWidth={2.5} />
              </View>
              <Text style={styles.statNumber}>{activeGoals}</Text>
              <Text style={styles.statLabel}>Active Goals</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Award size={20} color="#10B981" strokeWidth={2.5} />
              </View>
              <Text style={styles.statNumber}>{completedGoals}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={20} color="#F59E0B" strokeWidth={2.5} />
              </View>
              <Text style={styles.statNumber}>
                {goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Goals List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Zap size={18} color="#6366F1" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Active Goals</Text>
            </View>
            <Text style={styles.sectionCount}>{activeGoals}</Text>
          </View>

          {goals.filter(goal => !goal.isCompleted).map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </View>

        {/* Completed Goals Section */}
        {completedGoals > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Award size={18} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.sectionTitle}>Completed Goals</Text>
              </View>
              <Text style={styles.sectionCount}>{completedGoals}</Text>
            </View>

            {goals.filter(goal => goal.isCompleted).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </View>
        )}

        {/* Inspiration Section */}
        <View style={styles.inspirationSection}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2' }}
            style={styles.inspirationImage}
          />
          <View style={styles.inspirationOverlay}>
            <Star size={24} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.inspirationTitle}>Keep Going!</Text>
            <Text style={styles.inspirationText}>
              Every small step brings you closer to your dreams
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const progressPercentage = (goal.progress / goal.target) * 100;
  
  return (
    <TouchableOpacity style={styles.goalCard} activeOpacity={0.8}>
      <View style={styles.goalHeader}>
        <View style={[styles.goalColorIndicator, { backgroundColor: goal.color }]} />
        <View style={styles.goalInfo}>
          <Text style={[styles.goalTitle, goal.isCompleted && styles.completedText]}>
            {goal.title}
          </Text>
          <Text style={styles.goalDescription}>{goal.description}</Text>
        </View>
        <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
      </View>

      <View style={styles.goalProgress}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {goal.progress} of {goal.target} {goal.isCompleted ? '✓' : ''}
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
      </View>

      <View style={styles.goalFooter}>
        <View style={styles.categoryBadge}>
          <Text style={[styles.categoryText, { color: goal.color }]}>
            {goal.category}
          </Text>
        </View>
        
        <View style={styles.dueDateContainer}>
          <Calendar size={14} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.dueDate}>{goal.dueDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    padding: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  goalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 20,
  },
  goalProgress: {
    marginBottom: 16,
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
    fontFamily: 'Inter-Bold',
    color: '#6366F1',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  inspirationSection: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  inspirationImage: {
    width: '100%',
    height: '100%',
  },
  inspirationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  inspirationTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 8,
  },
  inspirationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
});