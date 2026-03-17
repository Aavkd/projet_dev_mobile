import { Redirect, Stack } from 'expo-router'
import { useAuth } from '../../../src/contexts/AuthContext'

export default function ClientLayout() {
  const { loading, userDoc } = useAuth()

  if (!loading && (!userDoc || userDoc.role !== 'client')) {
    return <Redirect href="/" />
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f5f7fb' },
        headerShadowVisible: false,
        headerTitleStyle: { color: '#10213a' }
      }}
    />
  )
}
