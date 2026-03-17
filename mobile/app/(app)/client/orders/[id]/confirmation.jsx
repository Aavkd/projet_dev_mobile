import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../../../../src/contexts/AuthContext'
import { orderService } from '../../../../../src/services/orderService'

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadData() {
      if (!user?.$id) return
      try {
        const ordersResponse = await orderService.listOrdersByClient(user.$id)
        const found = ordersResponse.documents.find((item) => item.$id === String(id))
        if (!mounted) return
        setOrder(found || null)

        if (found) {
          const itemsResponse = await orderService.getOrderItems(found.$id)
          if (!mounted) return
          setItems(itemsResponse.documents)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [id, user])

  if (loading) {
    return (
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    )
  }

  if (!order) {
    return (
      <View style={styles.loaderBox}>
        <Text style={styles.error}>Order not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Order confirmed</Text>
        <Text style={styles.meta}>Tracking: #{order.$id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.meta}>Status: {order.status}</Text>
        <Text style={styles.total}>Total: {Number(order.total || 0).toFixed(2)} EUR</Text>

        {items.map((item) => (
          <Text key={item.$id} style={styles.item}>
            {item.quantity}x {item.product_name} ({Number(item.unit_price || 0).toFixed(2)} EUR)
          </Text>
        ))}

        <Link href="/(app)/client/orders" style={styles.link}>
          Back to my orders
        </Link>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16 },
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fb' },
  error: { color: '#b42318', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbe4f4',
    borderRadius: 12,
    padding: 14,
    gap: 6
  },
  title: { fontSize: 22, fontWeight: '700', color: '#10213a' },
  meta: { color: '#4f617c' },
  total: { color: '#1f6feb', fontWeight: '700', marginTop: 6 },
  item: { color: '#42526b', fontSize: 13 },
  link: { color: '#1f6feb', marginTop: 10, fontWeight: '700' }
})
