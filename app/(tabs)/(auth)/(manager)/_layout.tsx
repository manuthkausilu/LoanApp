import { Stack } from 'expo-router';
import React from 'react';

export default function ManagerLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="dashboard" 
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="loan-list"
        options={{
          gestureEnabled: true,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="loan-applications"
        options={{
          gestureEnabled: true,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="pdf-viewer"
        options={{
          gestureEnabled: true,
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
