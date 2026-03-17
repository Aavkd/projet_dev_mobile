import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../../../src/lib/env'
import { useAuth } from '../../../src/contexts/AuthContext'
import { orderService } from '../../../src/services/orderService'
import { useRealtime } from '../../../src/hooks/useRealtime'

export default function MerchantOrdersScreen() {
  const { user } = useAuth()
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
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pending orders</Text>
      {orders.length === 0 ? <Text style={styles.meta}>No pending orders</Text> : null}

      {orders.map((order) => (
        <View key={order.$id} style={styles.card}>
          <Text style={styles.orderId}>#{order.$id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.meta}>Total: {Number(order.total || 0).toFixed(2)} EUR</Text>
          {order.items?.map((item) => (
            <Text key={item.$id} style={styles.itemText}>
              {item.quantity}x {item.product_name}
            </Text>
          ))}
          <Pressable style={styles.primaryBtn} onPress={() => markReady(order.$id, order.client_id)}>
            <Text style={styles.primaryBtnText}>Mark ready</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, gap: 10 },
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fb' },
  title: { fontSize: 24, fontWeight: '700', color: '#10213a' },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbe4f4',
    borderRadius: 12,
    padding: 12,
    gap: 4
  },
  orderId: { color: '#10213a', fontWeight: '700' },
  meta: { color: '#576a86' },
  itemText: { color: '#42526b', fontSize: 12 },
  primaryBtn: { marginTop: 8, borderRadius: 10, backgroundColor: '#1f6feb', alignItems: 'center', paddingVertical: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' }
})
