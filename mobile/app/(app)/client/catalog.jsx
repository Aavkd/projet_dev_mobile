import { useEffect, useMemo, useState } from 'react'
import { Link } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useCart } from '../../../src/contexts/CartContext'
import { productService } from '../../../src/services/productService'

export default function CatalogScreen() {
  const [products, setProducts] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart } = useCart()

  useEffect(() => {
    productService
      .listProducts({ available: true })
      .then((response) => setProducts(response.documents))
      .catch((err) => setError(err?.message || 'Unable to load catalog'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => [...new Set(products.map((item) => item.category).filter(Boolean))],
    [products]
  )

  const filteredProducts = useMemo(() => {
    if (!categoryFilter) return products
    return products.filter((product) => product.category === categoryFilter)
  }, [products, categoryFilter])

  if (loading) {
    return (
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Catalog</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <Pressable style={[styles.pill, !categoryFilter && styles.pillActive]} onPress={() => setCategoryFilter('')}>
          <Text style={[styles.pillText, !categoryFilter && styles.pillTextActive]}>All</Text>
        </Pressable>
        {categories.map((category) => (
          <Pressable
            key={category}
            style={[styles.pill, categoryFilter === category && styles.pillActive]}
            onPress={() => setCategoryFilter(category)}
          >
            <Text style={[styles.pillText, categoryFilter === category && styles.pillTextActive]}>{category}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.list}>
        {filteredProducts.map((product) => (
          <View key={product.$id} style={styles.card}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.meta}>{product.category || 'No category'}</Text>
            <Text style={styles.meta}>Stock: {product.stock}</Text>
            <Text style={styles.price}>{Number(product.price || 0).toFixed(2)} EUR</Text>

            <View style={styles.row}>
              <Link href={{ pathname: '/(app)/client/product/[id]', params: { id: product.$id } }} asChild>
                <Pressable style={styles.secondaryBtn}><Text style={styles.secondaryBtnText}>Details</Text></Pressable>
              </Link>
              <Pressable
                style={[styles.primaryBtn, product.stock <= 0 && styles.btnDisabled]}
                disabled={product.stock <= 0}
                onPress={() => addToCart(product, 1)}
              >
                <Text style={styles.primaryBtnText}>Add</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, gap: 12 },
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fb' },
  title: { fontSize: 24, fontWeight: '700', color: '#10213a' },
  error: { color: '#b42318' },
  filterRow: { gap: 8, paddingVertical: 4 },
  pill: { borderWidth: 1, borderColor: '#c9d6ea', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillActive: { backgroundColor: '#1f6feb', borderColor: '#1f6feb' },
  pillText: { color: '#42526b', fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  list: { gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbe4f4',
    borderRadius: 12,
    padding: 12,
    gap: 4
  },
  productName: { fontSize: 16, fontWeight: '700', color: '#10213a' },
  meta: { color: '#576a86', fontSize: 12 },
  price: { color: '#1f6feb', fontSize: 16, fontWeight: '700', marginTop: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c9d6ea',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10
  },
  secondaryBtnText: { color: '#42526b', fontWeight: '600' },
  primaryBtn: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#1f6feb'
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { backgroundColor: '#90b4f5' }
})
