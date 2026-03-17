import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import AppButton from '../../../src/components/ui/AppButton'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useTheme } from '../../../src/theme/ThemeProvider'
import { orderService } from '../../../src/services/orderService'

export default function MerchantOrderHistoryScreen() {
  const { user } = useAuth()
  const { colors, radius, spacing, typography } = useTheme()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!user?.$id) return
    const response = await orderService.listOrdersByMerchant(user.$id)
    setOrders(response.documents.filter((item) => item.status === 'ready' || item.status === 'done'))
    setLoading(false)
  }

  useEffect(() => {
    refresh().catch(() => setLoading(false))
  }, [user])

  async function markDone(orderId, clientId) {
    await orderService.updateOrderStatus(orderId, 'done', clientId)
    await refresh()
  }

  if (loading) {
    return (
      <View style={[styles.loaderBox, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading history...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.md }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>Order history</Text>
        <Text style={[styles.heroMeta, { color: colors.textMuted }]}>Review ready and completed orders.</Text>
      </View>

      {orders.length === 0 ? (
        <View style={[styles.emptyCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md }]}> 
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders in history</Text>
          <Text style={[styles.emptyMeta, { color: colors.textMuted }]}>Completed operations will appear here.</Text>
        </View>
      ) : null}

      {orders.map((order) => (
        <View key={order.$id} style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xxs }]}> 
          <View style={styles.topRow}>
            <Text style={[styles.orderId, { color: colors.text }]}>#{order.$id.slice(-6).toUpperCase()}</Text>
            <View
              style={[
                styles.statusChip,
                {
                  borderRadius: radius.pill,
                  borderColor: order.status === 'done' ? '#9fd8bf' : '#f0c981',
                  backgroundColor: order.status === 'done' ? '#e7f7ef' : '#fff2dc'
                }
              ]}
            >
              <Text style={{ color: order.status === 'done' ? '#17784f' : '#a05f0a', fontWeight: '700', fontSize: 11 }}>{order.status}</Text>
            </View>
          </View>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Total: {Number(order.total || 0).toFixed(2)} EUR</Text>
          {order.status === 'ready' ? (
            <AppButton title="Mark collected" onPress={() => markDone(order.$id, order.client_id)} style={[styles.fullBtn, { marginTop: spacing.xs }]} />
          ) : null}
        </View>
      ))}
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
  emptyCard: { borderWidth: 1, alignItems: 'center', gap: 2 },
  emptyTitle: { fontWeight: '700' },
  emptyMeta: { fontSize: 12 },
  card: {
    borderWidth: 1,
    shadowColor: '#18273b',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusChip: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  orderId: { fontWeight: '800', fontSize: 16 },
  meta: { fontSize: 12 },
  fullBtn: { width: '100%' }
})
