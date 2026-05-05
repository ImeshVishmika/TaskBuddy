// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, useTheme } from './context/Theme';
import { View, ActivityIndicator } from 'react-native';

function AppNavigator() {
  const { username, isLoading, colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inOnboardingGroup = segments[0] === 'firstTimePage';

    if (!username && !inOnboardingGroup) {
      // Redirect to onboarding if no name
      router.replace('/firstTimePage');
    } else if (username && inOnboardingGroup) {
      // If they have a name, don't let them go back to onboarding
      router.replace('/');
    }
  }, [username, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="firstTimePage" />
    </Stack>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}