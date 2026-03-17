import { useCallback, useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../../../../src/lib/env'
import { useAuth } from '../../../../src/contexts/AuthContext'
import { orderService } from '../../../../src/services/orderService'
import { useRealtime } from '../../../../src/hooks/useRealtime'

export default function ClientOrdersScreen() {
  const { user } = useAuth()
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
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My orders</Text>
      {orders.length === 0 ? <Text style={styles.meta}>No orders yet</Text> : null}

      {orders.map((order) => (
        <View key={order.$id} style={styles.card}>
          <Text style={styles.orderId}>#{order.$id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.meta}>Status: {order.status}</Text>
          <Text style={styles.meta}>Total: {Number(order.total || 0).toFixed(2)} EUR</Text>
          {order.items?.map((item) => (
            <Text key={item.$id} style={styles.itemText}>
              {item.quantity}x {item.product_name}
            </Text>
          ))}
          <Link href={{ pathname: '/(app)/client/orders/[id]/confirmation', params: { id: order.$id } }} style={styles.link}>
            Open confirmation
          </Link>
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
  orderId: { color: '#10213a', fontSize: 16, fontWeight: '700' },
  meta: { color: '#576a86' },
  itemText: { color: '#42526b', fontSize: 12 },
  link: { color: '#1f6feb', fontWeight: '600', marginTop: 4 }
})
