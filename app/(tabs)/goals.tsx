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
  Star,
  Plus,
  ChevronRight,
  Award,
  CheckCircle2,
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
              <Text style={styles.headerSubtitle}>Track your progress</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#EEF2FF' }]}>
                <Target size={18} color="#4F46E5" strokeWidth={2} />
              </View>
              <Text style={styles.statNumber}>{activeGoals}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
                <Award size={18} color="#10B981" strokeWidth={2} />
              </View>
              <Text style={styles.statNumber}>{completedGoals}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                <TrendingUp size={18} color="#F59E0B" strokeWidth={2} />
              </View>
              <Text style={styles.statNumber}>
                {goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Success</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Goals List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{activeGoals}</Text>
            </View>
          </View>

          {goals.filter(goal => !goal.isCompleted).map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </View>

        {/* Completed Goals Section */}
        {completedGoals > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Completed Goals</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{completedGoals}</Text>
              </View>
            </View>

            {goals.filter(goal => goal.isCompleted).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </View>
        )}

        {/* Inspiration Section */}
        <View style={styles.inspirationSection}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400&h=160&dpr=2' }}
            style={styles.inspirationImage}
          />
          <View style={styles.inspirationOverlay}>
            <Star size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.inspirationTitle}>Keep Going!</Text>
            <Text style={styles.inspirationText}>
              Every step brings you closer to your dreams
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
        {goal.isCompleted ? (
          <CheckCircle2 size={20} color="#10B981" strokeWidth={2} />
        ) : (
          <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
        )}
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
    marginBottom: 20,
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
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
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  inspirationSection: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
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
    backgroundColor: 'rgba(79, 70, 229, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inspirationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 6,
    marginBottom: 4,
  },
  inspirationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
});