import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useTheme } from '../../../src/theme/ThemeProvider'
import { statsService } from '../../../src/services/statsService'

export default function MerchantDashboardScreen() {
  const { user } = useAuth()
  const { colors, radius, spacing, typography } = useTheme()
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
      <View style={[styles.loaderBox, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading dashboard...</Text>
      </View>
    )
  }

  if (!stats) {
    return (
      <View style={[styles.loaderBox, { backgroundColor: colors.background }]}>
        <Text style={[styles.error, { color: colors.danger }]}>Unable to load dashboard</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.md }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>Dashboard</Text>
        <Text style={[styles.heroMeta, { color: colors.textMuted }]}>Your business performance at a glance.</Text>
      </View>

      <View style={[styles.metricCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm }]}> 
        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Total orders</Text>
        <Text style={[styles.metricValue, { color: colors.text }]}>{stats.totalOrders}</Text>
      </View>

      <View style={[styles.metricCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm }]}> 
        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Revenue</Text>
        <Text style={[styles.metricValue, { color: colors.primary }]}>{stats.revenue.toFixed(2)} EUR</Text>
      </View>

      <View style={[styles.metricCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm }]}> 
        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>By status</Text>
        <View style={[styles.statusWrap, { gap: spacing.xs }]}> 
          {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => (
            <View key={status} style={[styles.statusChip, { borderRadius: radius.pill, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSoft }]}> 
              <Text style={[styles.statusLine, { color: colors.text }]}>{status}: {count}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {},
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loaderText: { fontWeight: '600' },
  hero: { borderWidth: 1 },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  heroMeta: { fontSize: 13 },
  error: { fontWeight: '700' },
  metricCard: {
    borderWidth: 1,
    gap: 6,
    shadowColor: '#18273b',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2
  },
  metricLabel: { fontWeight: '700' },
  metricValue: { fontSize: 24, fontWeight: '800' },
  statusWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  statusChip: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  statusLine: { fontSize: 12, fontWeight: '700' }
})
