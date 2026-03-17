import { Link, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import AppButton from '../../../src/components/ui/AppButton'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useCart } from '../../../src/contexts/CartContext'
import { useTheme } from '../../../src/theme/ThemeProvider'
import { addressService } from '../../../src/services/addressService'
import { orderService } from '../../../src/services/orderService'

export default function CartScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { cartItems, updateQuantity, removeFromCart, cartTotal, merchantId, clearCart } = useCart()

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { colors, radius, spacing, typography } = useTheme()

  useEffect(() => {
    if (!user?.$id) return

    addressService
      .listAddresses(user.$id)
      .then((response) => {
        setAddresses(response.documents)
        const defaultAddress = response.documents.find((item) => item.is_default)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.$id)
        } else if (response.documents.length > 0) {
          setSelectedAddressId(response.documents[0].$id)
        }
      })
      .catch(() => {})
  }, [user])

  async function placeOrder() {
    if (!selectedAddressId || cartItems.length === 0 || !merchantId) return

    setSubmitting(true)
    try {
      const order = await orderService.createOrder(
        cartItems,
        selectedAddressId,
        user.$id,
        merchantId,
        cartTotal
      )
      clearCart()
      router.replace({ pathname: '/(app)/client/orders/[id]/confirmation', params: { id: order.$id } })
    } finally {
      setSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <View style={[styles.emptyWrap, { backgroundColor: colors.background, padding: spacing.md }]}> 
        <View style={[styles.emptyCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.lg }]}> 
          <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Start adding products from the catalog.</Text>
          <View style={styles.emptyButtonWrap}>
            <Link href="/(app)/client/catalog" asChild>
              <Pressable
                style={[
                  styles.catalogBtn,
                  {
                    borderRadius: radius.md,
                    borderColor: colors.primary,
                    backgroundColor: colors.primarySoft,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.lg
                  }
                ]}
              >
                <Text style={[styles.catalogBtnText, { color: colors.primary }]}>Open catalog</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, backgroundColor: colors.primarySoft, borderColor: colors.border, padding: spacing.md }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>Cart</Text>
        <Text style={[styles.heroMeta, { color: colors.textMuted }]}>{cartItems.length} item(s) in your pickup order</Text>
      </View>

      <View style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xs }]}> 
        {cartItems.map((item) => (
          <View key={item.product_id} style={[styles.itemRow, { gap: spacing.xs, borderBottomColor: colors.border, paddingBottom: spacing.xs }]}> 
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{Number(item.price).toFixed(2)} EUR</Text>
            </View>
            <View style={[styles.counter, { borderColor: colors.borderStrong, borderRadius: radius.sm, paddingHorizontal: spacing.xs }]}> 
              <Pressable onPress={() => updateQuantity(item.product_id, item.quantity - 1)}>
                <Text style={[styles.counterBtn, { color: colors.primary }]}>-</Text>
              </Pressable>
              <Text style={[styles.counterValue, { color: colors.text }]}>{item.quantity}</Text>
              <Pressable onPress={() => updateQuantity(item.product_id, item.quantity + 1)}>
                <Text style={[styles.counterBtn, { color: colors.primary }]}>+</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => removeFromCart(item.product_id)}>
              <Text style={[styles.remove, { color: colors.danger }]}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xs }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Pickup address</Text>
        {addresses.length === 0 ? (
          <View style={styles.emptyButtonWrap}>
            <Link href="/(app)/client/addresses" asChild>
              <Pressable
                style={[
                  styles.secondaryBtn,
                  {
                    borderRadius: radius.md,
                    borderColor: colors.borderStrong,
                    backgroundColor: colors.surfaceSoft,
                    paddingVertical: spacing.sm
                  }
                ]}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Add address first</Text>
              </Pressable>
            </Link>
          </View>
        ) : (
          addresses.map((address) => (
            <Pressable
              key={address.$id}
              style={[
                styles.addressRow,
                {
                  borderRadius: radius.md,
                  borderColor: selectedAddressId === address.$id ? colors.primary : colors.border,
                  backgroundColor: selectedAddressId === address.$id ? colors.primarySoft : colors.surface,
                  padding: spacing.sm
                }
              ]}
              onPress={() => setSelectedAddressId(address.$id)}
            >
              <Text style={[styles.itemName, { color: colors.text }]}>{address.label}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{address.address}</Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xs }]}> 
        <Text style={[styles.summaryAmount, { color: colors.primary }]}>Total: {cartTotal.toFixed(2)} EUR</Text>
        <AppButton
          title={submitting ? 'Submitting...' : 'Place order'}
          onPress={placeOrder}
          disabled={submitting || addresses.length === 0}
          style={styles.fullBtn}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {},
  hero: { borderWidth: 1 },
  heroMeta: { fontSize: 13 },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  emptyCard: {
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
    gap: 6
  },
  emptySubtitle: { fontSize: 13 },
  emptyButtonWrap: { width: '100%' },
  catalogBtn: { borderWidth: 1, alignItems: 'center' },
  catalogBtnText: { fontWeight: '700' },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  card: {
    borderWidth: 1
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  itemName: { fontWeight: '700' },
  meta: { fontSize: 12 },
  counter: {
    borderWidth: 1,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  counterBtn: { fontSize: 20, fontWeight: '700' },
  counterValue: { fontWeight: '700' },
  remove: { fontWeight: '700', fontSize: 12 },
  sectionTitle: { fontWeight: '700', marginBottom: 2 },
  addressRow: {
    borderWidth: 1
  },
  summaryAmount: { fontSize: 18, fontWeight: '800' },
  fullBtn: { width: '100%' },
  secondaryBtn: {
    borderWidth: 1,
    alignItems: 'center'
  },
  secondaryBtnText: { fontWeight: '700' }
})
