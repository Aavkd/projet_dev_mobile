import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../../src/contexts/AuthContext'
import { orderService } from '../../../src/services/orderService'

export default function MerchantOrderHistoryScreen() {
  const { user } = useAuth()
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
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Order history</Text>
      {orders.length === 0 ? <Text style={styles.meta}>No orders in history</Text> : null}

      {orders.map((order) => (
        <View key={order.$id} style={styles.card}>
          <Text style={styles.orderId}>#{order.$id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.meta}>Status: {order.status}</Text>
          <Text style={styles.meta}>Total: {Number(order.total || 0).toFixed(2)} EUR</Text>
          {order.status === 'ready' ? (
            <Pressable style={styles.primaryBtn} onPress={() => markDone(order.$id, order.client_id)}>
              <Text style={styles.primaryBtnText}>Mark collected</Text>
            </Pressable>
          ) : null}
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
  primaryBtn: { marginTop: 8, borderRadius: 10, backgroundColor: '#1f6feb', alignItems: 'center', paddingVertical: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' }
})
