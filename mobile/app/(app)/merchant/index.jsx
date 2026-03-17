import { Link, useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import NotificationBell from '../../../src/components/NotificationBell'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useNotifications } from '../../../src/hooks/useNotifications'

export default function MerchantHomeScreen() {
  const router = useRouter()
  const { userDoc, logout } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()

  async function onLogout() {
    await logout()
    router.replace('/(auth)/login')
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Merchant space</Text>
      <Text style={styles.subtitle}>Welcome {userDoc?.name || 'Merchant'}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick actions</Text>
        <Link href="/(app)/merchant/dashboard" asChild>
          <Pressable style={styles.actionButton}><Text style={styles.actionText}>Dashboard</Text></Pressable>
        </Link>
        <Link href="/(app)/merchant/products" asChild>
          <Pressable style={styles.actionButton}><Text style={styles.actionText}>Products</Text></Pressable>
        </Link>
        <Link href="/(app)/merchant/categories" asChild>
          <Pressable style={styles.actionButton}><Text style={styles.actionText}>Categories</Text></Pressable>
        </Link>
        <Link href="/(app)/merchant/orders" asChild>
          <Pressable style={styles.actionButton}><Text style={styles.actionText}>Order queue</Text></Pressable>
        </Link>
        <Link href="/(app)/merchant/orders-history" asChild>
          <Pressable style={styles.actionButton}><Text style={styles.actionText}>Order history</Text></Pressable>
        </Link>
        <Link href="/(app)/merchant/schedule" asChild>
          <Pressable style={styles.actionButton}><Text style={styles.actionText}>Opening hours</Text></Pressable>
        </Link>
      </View>

      <NotificationBell
        unreadCount={unreadCount}
        notifications={notifications}
        onMarkAsRead={markAsRead}
      />

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb'
  },
  content: {
    padding: 16,
    gap: 14
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#10213a'
  },
  subtitle: {
    color: '#4f617c'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#dbe4f4',
    borderWidth: 1,
    padding: 12,
    gap: 10
  },
  cardTitle: {
    fontWeight: '700',
    color: '#10213a',
    marginBottom: 4
  },
  actionButton: {
    borderRadius: 10,
    borderColor: '#d4dcf0',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fbfdff'
  },
  actionText: {
    fontWeight: '600',
    color: '#1f6feb'
  },
  logoutButton: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#10213a',
    paddingVertical: 12,
    alignItems: 'center'
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700'
  }
})
