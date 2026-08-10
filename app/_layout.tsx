import '../global.css';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const theme = NAV_THEME[colorScheme ?? 'light'];

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <SafeAreaView
          className="mx-auto w-full max-w-5xl flex-1 bg-background"
          edges={['top', 'bottom', 'left', 'right']}>
          <Header />
          <View className="flex-1 p-6 max-w-5xl">
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="about" />
            </Stack>
          </View>
          <Footer />
        </SafeAreaView>
        <PortalHost />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
