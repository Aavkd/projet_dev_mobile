import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../../../../src/contexts/AuthContext'
import { useTheme } from '../../../../../src/theme/ThemeProvider'
import { orderService } from '../../../../../src/services/orderService'

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const { colors, radius, spacing, typography } = useTheme()
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
      <View style={[styles.loaderBox, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading order...</Text>
      </View>
    )
  }

  if (!order) {
    return (
      <View style={[styles.loaderBox, { backgroundColor: colors.background }]}> 
        <Text style={[styles.error, { color: colors.danger }]}>Order not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md }]}> 
      <View style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.xxs }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>Order confirmed</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>Tracking: #{order.$id.slice(-6).toUpperCase()}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>Status: {order.status}</Text>
        <Text style={[styles.total, { color: colors.primary }]}>Total: {Number(order.total || 0).toFixed(2)} EUR</Text>

        {items.map((item) => (
          <Text key={item.$id} style={[styles.item, { color: colors.textMuted }]}>
            {item.quantity}x {item.product_name} ({Number(item.unit_price || 0).toFixed(2)} EUR)
          </Text>
        ))}

        <Link href="/(app)/client/orders" style={[styles.link, { color: colors.primary }]}> 
          Back to my orders
        </Link>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {},
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loaderText: { fontWeight: '600' },
  error: { fontWeight: '700' },
  card: {
    borderWidth: 1,
    shadowColor: '#18273b',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2
  },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  meta: { fontSize: 13 },
  total: { fontWeight: '800', marginVertical: 6, fontSize: 18 },
  item: { fontSize: 13 },
  link: { marginTop: 10, fontWeight: '700' }
})
