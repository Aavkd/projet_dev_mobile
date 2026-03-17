import { Link } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../../../../src/lib/env'
import { useAuth } from '../../../../src/contexts/AuthContext'
import { productService } from '../../../../src/services/productService'
import { useRealtime } from '../../../../src/hooks/useRealtime'

export default function MerchantProductsScreen() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadProducts = useCallback(async () => {
    if (!user?.$id) return
    const response = await productService.listProducts({ merchantId: user.$id, orderDescCreated: true })
    setProducts(response.documents)
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadProducts().catch(() => setLoading(false))
  }, [loadProducts])

  useRealtime(
    APPWRITE_DATABASE_ID && COLLECTIONS.products
      ? `databases.${APPWRITE_DATABASE_ID}.collections.${COLLECTIONS.products}.documents`
      : null,
    useCallback(
      (event) => {
        if (event?.payload?.merchant_id === user?.$id) {
          loadProducts().catch(() => {})
        }
      },
      [loadProducts, user]
    )
  )

  async function removeProduct(id) {
    await productService.deleteProduct(id)
    await loadProducts()
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
      <Text style={styles.title}>Products</Text>
      <Link href="/(app)/merchant/products/new" asChild>
        <Pressable style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Add product</Text></Pressable>
      </Link>

      {products.length === 0 ? <Text style={styles.meta}>No products yet</Text> : null}

      {products.map((item) => (
        <View key={item.$id} style={styles.card}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.meta}>Category: {item.category || 'N/A'}</Text>
          <Text style={styles.meta}>Price: {Number(item.price || 0).toFixed(2)} EUR</Text>
          <Text style={styles.meta}>Stock: {item.stock}</Text>
          <Text style={styles.meta}>Available: {item.available ? 'Yes' : 'No'}</Text>

          <View style={styles.row}>
            <Link href={{ pathname: '/(app)/merchant/products/[id]', params: { id: item.$id } }} asChild>
              <Pressable><Text style={styles.link}>Edit</Text></Pressable>
            </Link>
            <Pressable onPress={() => removeProduct(item.$id)}>
              <Text style={styles.remove}>Delete</Text>
            </Pressable>
          </View>
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
    gap: 3
  },
  itemName: { color: '#10213a', fontWeight: '700' },
  meta: { color: '#576a86' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  link: { color: '#1f6feb', fontWeight: '600' },
  remove: { color: '#b42318', fontWeight: '600' },
  primaryBtn: { borderRadius: 10, backgroundColor: '#1f6feb', alignItems: 'center', paddingVertical: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' }
})
