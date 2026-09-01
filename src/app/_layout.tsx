import '../../global.css';

import { Header } from '@/components/header';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { ScrollView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from '@/services/auth/context';
import { SplashScreenController } from '@/app/splash';

export { ErrorBoundary } from 'expo-router';

const RootLayout = () => {
  return (
    <SessionProvider>
      <SplashScreenController />
      <MainLayout />
    </SessionProvider>
  );
}

export default RootLayout;

const MainLayout = () => {
  const { colorScheme } = useColorScheme();
  const theme = NAV_THEME[colorScheme ?? 'light'];

  const { session } = useSession();

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <SafeAreaView
          className="h-full mx-auto w-full max-w-5xl bg-background"
          edges={['top', 'bottom', 'left', 'right']}>
          <ScrollView className="w-full">
            <Header userLoggedIn={session === null} />

            <View className="h-full p-6 w-full">
              <Stack screenOptions={{ headerShown: false }} >
                <Stack.Protected guard={!!session}>
                  <Stack.Screen name={"(private)"} />
                </Stack.Protected>

                <Stack.Protected guard={!session}>
                  <Stack.Screen name="public" />
                </Stack.Protected>

              </Stack>
            </View>

          </ScrollView>
        </SafeAreaView>
        <PortalHost />
      </GestureHandlerRootView>
    </ThemeProvider >
  );
}
