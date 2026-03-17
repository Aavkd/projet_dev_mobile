import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../src/contexts/AuthContext'

export default function IndexPage() {
  const { loading, userDoc } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    )
  }

  if (!userDoc) {
    return <Redirect href="/(auth)/login" />
  }

  if (userDoc.role === 'merchant') {
    return <Redirect href="/(app)/merchant" />
  }

  return <Redirect href="/(app)/client" />
}
