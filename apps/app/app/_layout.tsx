import { Drawer } from 'expo-router/drawer'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { queryClient } from '../lib/queryClient'
import { theme } from '../lib/theme'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
        <Drawer
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.color.bgBase,
              borderBottomWidth: 1,
              borderBottomColor: theme.color.border,
            },
            headerTintColor: theme.color.textPrimary,
            headerTitleStyle: {
              ...theme.font.title,
              color: theme.color.textPrimary,
            },
            sceneStyle: {
              backgroundColor: theme.color.bgBase,
            },
            drawerStyle: {
              backgroundColor: theme.color.bgElevated,
              width: 280,
            },
            drawerActiveBackgroundColor: theme.color.bgBase,
            drawerActiveTintColor: theme.color.accent,
            drawerInactiveTintColor: theme.color.textSecondary,
            drawerLabelStyle: {
              ...theme.font.body,
              marginLeft: -16,
            },
          }}
        >
          <Drawer.Screen name="index" options={{ title: '채팅' }} />
          <Drawer.Screen name="goals/index" options={{ title: '목표' }} />
          <Drawer.Screen name="settings" options={{ title: '설정' }} />
          <Drawer.Screen
            name="goals/[goalId]"
            options={{ title: '목표 상세', drawerItemStyle: { display: 'none' } }}
          />
          </Drawer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
