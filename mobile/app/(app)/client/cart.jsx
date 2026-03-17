import { Link, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useCart } from '../../../src/contexts/CartContext'
import { addressService } from '../../../src/services/addressService'
import { orderService } from '../../../src/services/orderService'

export default function CartScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { cartItems, updateQuantity, removeFromCart, cartTotal, merchantId, clearCart } = useCart()

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      <View style={styles.emptyWrap}>
        <Text style={styles.title}>Your cart is empty</Text>
        <Link href="/(app)/client/catalog" asChild>
          <Pressable style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Open catalog</Text></Pressable>
        </Link>
      </View>
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cart</Text>
      <View style={styles.card}>
        {cartItems.map((item) => (
          <View key={item.product_id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.meta}>{Number(item.price).toFixed(2)} EUR</Text>
            </View>
            <View style={styles.counter}>
              <Pressable onPress={() => updateQuantity(item.product_id, item.quantity - 1)}>
                <Text style={styles.counterBtn}>-</Text>
              </Pressable>
              <Text style={styles.counterValue}>{item.quantity}</Text>
              <Pressable onPress={() => updateQuantity(item.product_id, item.quantity + 1)}>
                <Text style={styles.counterBtn}>+</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => removeFromCart(item.product_id)}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pickup address</Text>
        {addresses.length === 0 ? (
          <Link href="/(app)/client/addresses" asChild>
            <Pressable style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Add address first</Text>
            </Pressable>
          </Link>
        ) : (
          addresses.map((address) => (
            <Pressable
              key={address.$id}
              style={[styles.addressRow, selectedAddressId === address.$id && styles.addressRowActive]}
              onPress={() => setSelectedAddressId(address.$id)}
            >
              <Text style={styles.itemName}>{address.label}</Text>
              <Text style={styles.meta}>{address.address}</Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Total: {cartTotal.toFixed(2)} EUR</Text>
        <Pressable
          style={[styles.primaryBtn, (submitting || addresses.length === 0) && styles.btnDisabled]}
          disabled={submitting || addresses.length === 0}
          onPress={placeOrder}
        >
          <Text style={styles.primaryBtnText}>{submitting ? 'Submitting...' : 'Place order'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, gap: 12 },
  emptyWrap: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16
  },
  title: { fontSize: 24, fontWeight: '700', color: '#10213a' },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbe4f4',
    borderRadius: 12,
    padding: 12,
    gap: 8
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#edf1fa', paddingBottom: 8 },
  itemName: { color: '#10213a', fontWeight: '700' },
  meta: { color: '#6e7f99', fontSize: 12 },
  counter: {
    borderWidth: 1,
    borderColor: '#c9d6ea',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  counterBtn: { color: '#1f6feb', fontSize: 20, fontWeight: '700' },
  counterValue: { color: '#10213a', fontWeight: '700' },
  remove: { color: '#b42318', fontWeight: '600' },
  sectionTitle: { color: '#10213a', fontWeight: '700', marginBottom: 2 },
  addressRow: {
    borderWidth: 1,
    borderColor: '#d4dcf0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff'
  },
  addressRowActive: { borderColor: '#1f6feb', backgroundColor: '#f1f6ff' },
  primaryBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1f6feb'
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#c9d6ea',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10
  },
  secondaryBtnText: { color: '#1f6feb', fontWeight: '600' },
  btnDisabled: { backgroundColor: '#90b4f5' }
})
