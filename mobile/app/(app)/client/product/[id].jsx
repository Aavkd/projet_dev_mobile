import { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import AppButton from '../../../../src/components/ui/AppButton'
import { useCart } from '../../../../src/contexts/CartContext'
import { useTheme } from '../../../../src/theme/ThemeProvider'
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
  const { colors, radius, spacing, typography } = useTheme()

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
      <View style={[styles.loaderBox, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading product details...</Text>
      </View>
    )
  }

  if (!product) {
    return (
      <View style={[styles.loaderBox, { backgroundColor: colors.background }]}>
        <Text style={[styles.error, { color: colors.danger }]}>Product not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>{product.name}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>{Number(product.price || 0).toFixed(2)} EUR</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>Category: {product.category || 'N/A'}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>Stock: {product.stock}</Text>
      </View>

      <View style={[styles.qtyCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quantity</Text>
        <View style={[styles.qtyRow, { gap: spacing.sm }]}> 
          <Pressable
            style={[styles.qtyBtn, { borderRadius: radius.sm, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSoft }]}
            onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
          >
            <Text style={[styles.qtyBtnText, { color: colors.text }]}>-</Text>
          </Pressable>
          <Text style={[styles.qtyValue, { color: colors.text }]}>{quantity}</Text>
          <Pressable
            style={[styles.qtyBtn, { borderRadius: radius.sm, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSoft }]}
            onPress={() => setQuantity((prev) => Math.min(product.stock || 1, prev + 1))}
          >
            <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
          </Pressable>
        </View>

        <AppButton
          title="Add to cart"
          onPress={() => addToCart(product, quantity)}
          disabled={product.stock <= 0}
          style={[styles.fullBtn, { marginTop: spacing.sm }]}
        />
      </View>

      <View style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xxs }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Opening hours</Text>
        {schedule.length === 0 ? (
          <Text style={[styles.meta, { color: colors.textMuted }]}>No schedule set</Text>
        ) : (
          schedule.map((item) => (
            <Text key={item.$id} style={[styles.meta, { color: colors.textMuted }]}>
              {DAY_NAMES[item.day_of_week] || item.day_of_week}: {item.is_closed ? 'Closed' : `${item.open_time} - ${item.close_time}`}
            </Text>
          ))
        )}
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
  hero: { borderWidth: 1, gap: 2 },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  price: { fontSize: 26, fontWeight: '800', marginVertical: 6 },
  meta: { fontSize: 13 },
  qtyCard: { borderWidth: 1 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  qtyBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyBtnText: { fontSize: 20, fontWeight: '700' },
  qtyValue: { fontSize: 20, fontWeight: '700', width: 28, textAlign: 'center' },
  fullBtn: { width: '100%' },
  card: {
    borderWidth: 1
  },
  sectionTitle: { fontWeight: '700' }
})
