import { useCallback, useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../../../../src/lib/env'
import { useAuth } from '../../../../src/contexts/AuthContext'
import { useTheme } from '../../../../src/theme/ThemeProvider'
import { orderService } from '../../../../src/services/orderService'
import { useRealtime } from '../../../../src/hooks/useRealtime'

export default function ClientOrdersScreen() {
  const { user } = useAuth()
  const { colors, radius, spacing, typography } = useTheme()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    if (!user?.$id) return

    const response = await orderService.listOrdersByClient(user.$id)
    const withItems = await Promise.all(
      response.documents.map(async (order) => {
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
        if (event?.payload?.client_id === user?.$id) {
          loadOrders().catch(() => {})
        }
      },
      [loadOrders, user]
    )
  )

  if (loading) {
    return (
      <View style={[styles.loaderBox, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading your orders...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.md }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>My orders</Text>
        <Text style={[styles.heroMeta, { color: colors.textMuted }]}>Track progress from preparation to pickup.</Text>
      </View>

      {orders.length === 0 ? (
        <View style={[styles.emptyCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md }]}> 
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
          <Text style={[styles.emptyMeta, { color: colors.textMuted }]}>Your confirmed orders will appear here.</Text>
        </View>
      ) : null}

      {orders.map((order) => (
        <View key={order.$id} style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xxs }]}> 
          <View style={styles.orderTop}>
            <Text style={[styles.orderId, { color: colors.text }]}>#{order.$id.slice(-6).toUpperCase()}</Text>
            <View
              style={[
                styles.statusChip,
                {
                  borderRadius: radius.pill,
                  backgroundColor: order.status === 'pending' ? '#fff2dc' : colors.primarySoft,
                  borderColor: order.status === 'pending' ? '#f0c981' : colors.primary
                }
              ]}
            >
              <Text
                style={{
                  fontSize: typography.tiny,
                  fontWeight: '700',
                  color: order.status === 'pending' ? '#a05f0a' : colors.primary
                }}
              >
                {order.status}
              </Text>
            </View>
          </View>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Total: {Number(order.total || 0).toFixed(2)} EUR</Text>
          {order.items?.map((item) => (
            <Text key={item.$id} style={[styles.itemText, { color: colors.textMuted }]}>
              {item.quantity}x {item.product_name}
            </Text>
          ))}
          <View style={styles.linkRow}>
            <Link href={{ pathname: '/(app)/client/orders/[id]/confirmation', params: { id: order.$id } }} style={[styles.link, { color: colors.primary }]}> 
              Open confirmation
            </Link>
          </View>
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
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: '800' },
  statusChip: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  meta: { fontSize: 12 },
  itemText: { fontSize: 12 },
  linkRow: { marginTop: 4 },
  link: { fontWeight: '700' }
})
