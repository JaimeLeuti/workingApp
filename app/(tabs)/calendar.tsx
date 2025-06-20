import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, CircleCheck as CheckCircle2 } from 'lucide-react-native';

interface Event {
  id: string;
  title: string;
  time: string;
  duration: string;
  location?: string;
  attendees?: number;
  color: string;
  type: 'task' | 'meeting' | 'personal';
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const events: Event[] = [
    {
      id: '1',
      title: 'Team Standup',
      time: '09:00',
      duration: '30 min',
      location: 'Conference Room A',
      attendees: 5,
      color: '#4F46E5',
      type: 'meeting',
    },
    {
      id: '2',
      title: 'Review Project Proposal',
      time: '11:00',
      duration: '1 hour',
      color: '#8B5CF6',
      type: 'task',
    },
    {
      id: '3',
      title: 'Lunch with Sarah',
      time: '12:30',
      duration: '1 hour',
      location: 'Downtown Cafe',
      color: '#10B981',
      type: 'personal',
    },
    {
      id: '4',
      title: 'Client Presentation',
      time: '15:00',
      duration: '45 min',
      attendees: 8,
      color: '#F59E0B',
      type: 'meeting',
    },
  ];

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatMonth = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Calendar</Text>
              <Text style={styles.headerSubtitle}>{formatDate(selectedDate)}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Widget */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
            
            <Text style={styles.monthTitle}>{formatMonth(currentMonth)}</Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
              activeOpacity={0.7}
            >
              <ChevronRight size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Week Days */}
          <View style={styles.weekDaysContainer}>
            {weekDays.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !date && styles.emptyCell,
                  isToday(date) && styles.todayCell,
                  isSelected(date) && styles.selectedCell,
                ]}
                onPress={() => date && setSelectedDate(date)}
                disabled={!date}
                activeOpacity={0.7}
              >
                {date && (
                  <Text style={[
                    styles.dayText,
                    isToday(date) && styles.todayText,
                    isSelected(date) && styles.selectedText,
                  ]}>
                    {date.getDate()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Events */}
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{events.length}</Text>
            </View>
          </View>

          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EventCard({ event }: { event: Event }) {
  const getEventIcon = () => {
    switch (event.type) {
      case 'meeting':
        return <Users size={14} color={event.color} strokeWidth={2} />;
      case 'task':
        return <CheckCircle2 size={14} color={event.color} strokeWidth={2} />;
      default:
        return <CalendarIcon size={14} color={event.color} strokeWidth={2} />;
    }
  };

  return (
    <TouchableOpacity style={styles.eventCard} activeOpacity={0.8}>
      <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleContainer}>
            {getEventIcon()}
            <Text style={styles.eventTitle}>{event.title}</Text>
          </View>
          <Text style={styles.eventTime}>{event.time}</Text>
        </View>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Clock size={12} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.eventDetailText}>{event.duration}</Text>
          </View>
          
          {event.location && (
            <View style={styles.eventDetail}>
              <MapPin size={12} color="#9CA3AF" strokeWidth={2} />
              <Text style={styles.eventDetailText}>{event.location}</Text>
            </View>
          )}
          
          {event.attendees && (
            <View style={styles.eventDetail}>
              <Users size={12} color="#9CA3AF" strokeWidth={2} />
              <Text style={styles.eventDetailText}>{event.attendees} people</Text>
            </View>
          )}
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
  content: {
    flex: 1,
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    paddingVertical: 6,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 2,
  },
  emptyCell: {
    opacity: 0,
  },
  todayCell: {
    backgroundColor: '#EEF2FF',
  },
  selectedCell: {
    backgroundColor: '#4F46E5',
  },
  dayText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  todayText: {
    color: '#4F46E5',
    fontFamily: 'Inter-SemiBold',
  },
  selectedText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  eventsSection: {
    marginBottom: 20,
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
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  eventColorBar: {
    width: 3,
  },
  eventContent: {
    flex: 1,
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 6,
    flex: 1,
  },
  eventTime: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginLeft: 3,
  },
});