import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { CircleCheck as CheckCircle2, Target, Calendar, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useEffect } from 'react';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  // Function to handle tab press and navigate to today for the index tab
  const handleTabPress = (routeName: string) => {
    if (routeName === 'index') {
      // If we're already on the index tab, trigger a navigation to today
      // This will be handled by a custom event or state management
      if (pathname === '/') {
        // Emit a custom event that the index screen can listen to
        const event = new CustomEvent('goToToday');
        window.dispatchEvent(event);
      }
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 88 : 72,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ size, color }) => (
            <CheckCircle2 size={24} color={color} strokeWidth={2.5} />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress('index'),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ size, color }) => (
            <Target size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}