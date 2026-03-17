import { Redirect, Stack } from 'expo-router'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useTheme } from '../../../src/theme/ThemeProvider'

export default function MerchantLayout() {
  const { loading, userDoc } = useAuth()
  const { colors } = useTheme()

  if (!loading && (!userDoc || userDoc.role !== 'merchant')) {
    return <Redirect href="/" />
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundSoft },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerTintColor: colors.primary
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="products/index" options={{ title: 'Products' }} />
      <Stack.Screen name="products/new" options={{ title: 'New product' }} />
      <Stack.Screen name="products/[id]" options={{ title: 'Edit product' }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
      <Stack.Screen name="orders" options={{ title: 'Order queue' }} />
      <Stack.Screen name="orders-history" options={{ title: 'Order history' }} />
      <Stack.Screen name="schedule" options={{ title: 'Opening hours' }} />
    </Stack>
  )
}
