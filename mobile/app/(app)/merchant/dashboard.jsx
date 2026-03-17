import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../../src/contexts/AuthContext'
import { statsService } from '../../../src/services/statsService'

export default function MerchantDashboardScreen() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.$id) return

    statsService
      .getMerchantStats(user.$id)
      .then((value) => setStats(value))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    )
  }

  if (!stats) {
    return (
      <View style={styles.loaderBox}>
        <Text style={styles.error}>Unable to load dashboard</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Total orders</Text>
        <Text style={styles.metricValue}>{stats.totalOrders}</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Revenue</Text>
        <Text style={styles.metricValue}>{stats.revenue.toFixed(2)} EUR</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>By status</Text>
        {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => (
          <Text key={status} style={styles.statusLine}>
            {status}: {count}
          </Text>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, gap: 10 },
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fb' },
  title: { fontSize: 24, fontWeight: '700', color: '#10213a' },
  error: { color: '#b42318', fontWeight: '700' },
  metricCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe4f4',
    backgroundColor: '#fff',
    padding: 12,
    gap: 4
  },
  metricLabel: { color: '#576a86', fontWeight: '600' },
  metricValue: { color: '#10213a', fontSize: 22, fontWeight: '700' },
  statusLine: { color: '#42526b', fontSize: 13 }
})
