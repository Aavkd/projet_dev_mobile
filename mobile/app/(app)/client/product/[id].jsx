import { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useCart } from '../../../../src/contexts/CartContext'
import { productService } from '../../../../src/services/productService'
import { scheduleService } from '../../../../src/services/scheduleService'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams()
  const [product, setProduct] = useState(null)
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        const doc = await productService.getProduct(String(id))
        if (!mounted) return
        setProduct(doc)

        if (doc?.merchant_id) {
          const hours = await scheduleService.getOpeningHours(doc.merchant_id)
          if (!mounted) return
          setSchedule(hours)
        }
      } catch {
        if (mounted) setProduct(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    )
  }

  if (!product) {
    return (
      <View style={styles.loaderBox}>
        <Text style={styles.error}>Product not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>{Number(product.price || 0).toFixed(2)} EUR</Text>
      <Text style={styles.meta}>Category: {product.category || 'N/A'}</Text>
      <Text style={styles.meta}>Stock: {product.stock}</Text>

      <View style={styles.qtyRow}>
        <Pressable style={styles.qtyBtn} onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}>
          <Text style={styles.qtyBtnText}>-</Text>
        </Pressable>
        <Text style={styles.qtyValue}>{quantity}</Text>
        <Pressable
          style={styles.qtyBtn}
          onPress={() => setQuantity((prev) => Math.min(product.stock || 1, prev + 1))}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.primaryBtn, product.stock <= 0 && styles.btnDisabled]}
        disabled={product.stock <= 0}
        onPress={() => addToCart(product, quantity)}
      >
        <Text style={styles.primaryBtnText}>Add to cart</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Opening hours</Text>
        {schedule.length === 0 ? (
          <Text style={styles.meta}>No schedule set</Text>
        ) : (
          schedule.map((item) => (
            <Text key={item.$id} style={styles.meta}>
              {DAY_NAMES[item.day_of_week] || item.day_of_week}: {item.is_closed ? 'Closed' : `${item.open_time} - ${item.close_time}`}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, gap: 8 },
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fb' },
  error: { color: '#b42318', fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '700', color: '#10213a' },
  price: { fontSize: 22, color: '#1f6feb', fontWeight: '700' },
  meta: { color: '#4f617c' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  qtyBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c9d6ea',
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyBtnText: { color: '#10213a', fontSize: 20, fontWeight: '600' },
  qtyValue: { fontSize: 18, fontWeight: '700', color: '#10213a', width: 24, textAlign: 'center' },
  primaryBtn: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1f6feb'
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { backgroundColor: '#90b4f5' },
  card: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe4f4',
    backgroundColor: '#fff',
    padding: 12,
    gap: 4
  },
  sectionTitle: { color: '#10213a', fontWeight: '700' }
})
