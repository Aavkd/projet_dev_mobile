import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import NotificationToast from '../src/components/NotificationToast'
import { AuthProvider } from '../src/contexts/AuthContext'
import { CartProvider } from '../src/contexts/CartContext'
import { useNotifications } from '../src/hooks/useNotifications'
import { ThemeProvider } from '../src/theme/ThemeProvider'

function GlobalNotificationLayer() {
  const { notifications } = useNotifications()
  return <NotificationToast notifications={notifications} />
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <GlobalNotificationLayer />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
