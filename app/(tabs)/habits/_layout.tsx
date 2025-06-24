import { Stack } from 'expo-router';

export default function HabitsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="create" 
        options={{ 
          presentation: 'modal',
          headerShown: false 
        }} 
      />
      <Stack.Screen name="[id]" />
      <Stack.Screen 
        name="[id]/edit" 
        options={{ 
          presentation: 'modal',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}