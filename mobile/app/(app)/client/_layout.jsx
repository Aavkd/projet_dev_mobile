import { Redirect, Stack } from 'expo-router'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useTheme } from '../../../src/theme/ThemeProvider'

export default function ClientLayout() {
  const { loading, userDoc } = useAuth()
  const { colors } = useTheme()

  if (!loading && (!userDoc || userDoc.role !== 'client')) {
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
      <Stack.Screen name="catalog" options={{ title: 'Catalog' }} />
      <Stack.Screen name="cart" options={{ title: 'Cart' }} />
      <Stack.Screen name="addresses" options={{ title: 'Addresses' }} />
      <Stack.Screen name="orders/index" options={{ title: 'My orders' }} />
      <Stack.Screen name="orders/[id]/confirmation" options={{ title: 'Order confirmation' }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Product details' }} />
    </Stack>
  )
}
