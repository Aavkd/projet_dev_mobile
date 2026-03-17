import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../../../src/lib/env'
import AppButton from '../../../src/components/ui/AppButton'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useTheme } from '../../../src/theme/ThemeProvider'
import { orderService } from '../../../src/services/orderService'
import { useRealtime } from '../../../src/hooks/useRealtime'

export default function MerchantOrdersScreen() {
  const { user } = useAuth()
  const { colors, radius, spacing, typography } = useTheme()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    if (!user?.$id) return

    const response = await orderService.listOrdersByMerchant(user.$id)
    const pending = response.documents.filter((item) => item.status === 'pending')

    const withItems = await Promise.all(
      pending.map(async (order) => {
        const itemsResponse = await orderService.getOrderItems(order.$id)
        return { ...order, items: itemsResponse.documents }
      })
    )

    setOrders(withItems)
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadOrders().catch(() => setLoading(false))
  }, [loadOrders])

  useRealtime(
    APPWRITE_DATABASE_ID && COLLECTIONS.orders
      ? `databases.${APPWRITE_DATABASE_ID}.collections.${COLLECTIONS.orders}.documents`
      : null,
    useCallback(
      (event) => {
        if (event?.payload?.merchant_id === user?.$id) {
          loadOrders().catch(() => {})
        }
      },
      [loadOrders, user]
    )
  )

  async function markReady(orderId, clientId) {
    await orderService.updateOrderStatus(orderId, 'ready', clientId)
    await loadOrders()
  }

  if (loading) {
    return (
      <View style={[styles.loaderBox, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading pending orders...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.md }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>Pending orders</Text>
        <Text style={[styles.heroMeta, { color: colors.textMuted }]}>Prepare each order and mark it ready for pickup.</Text>
      </View>

      {orders.length === 0 ? (
        <View style={[styles.emptyCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md }]}> 
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No pending orders</Text>
          <Text style={[styles.emptyMeta, { color: colors.textMuted }]}>New orders will appear here in real time.</Text>
        </View>
      ) : null}

      {orders.map((order) => (
        <View key={order.$id} style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xxs }]}> 
          <View style={styles.topRow}>
            <Text style={[styles.orderId, { color: colors.text }]}>#{order.$id.slice(-6).toUpperCase()}</Text>
            <View style={[styles.pendingChip, { borderRadius: radius.pill, borderColor: '#f0c981', backgroundColor: '#fff2dc' }]}>
              <Text style={styles.pendingText}>pending</Text>
            </View>
          </View>

          <Text style={[styles.meta, { color: colors.textMuted }]}>Total: {Number(order.total || 0).toFixed(2)} EUR</Text>
          {order.items?.map((item) => (
            <Text key={item.$id} style={[styles.itemText, { color: colors.textMuted }]}>
              {item.quantity}x {item.product_name}
            </Text>
          ))}
          <AppButton title="Mark ready" onPress={() => markReady(order.$id, order.client_id)} style={[styles.fullBtn, { marginTop: spacing.xs }]} />
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
  pendingChip: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  pendingText: { color: '#a05f0a', fontWeight: '700', fontSize: 11 },
  orderId: { fontWeight: '800', fontSize: 16 },
  meta: { fontSize: 12 },
  itemText: { fontSize: 12 },
  fullBtn: { width: '100%' }
})
