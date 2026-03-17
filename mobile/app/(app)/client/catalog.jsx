import { useEffect, useMemo, useState } from 'react'
import { Link } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import AppButton from '../../../src/components/ui/AppButton'
import { useCart } from '../../../src/contexts/CartContext'
import { useTheme } from '../../../src/theme/ThemeProvider'
import { productService } from '../../../src/services/productService'

export default function CatalogScreen() {
  const [products, setProducts] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart } = useCart()
  const { colors, radius, spacing, typography } = useTheme()

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
      <View style={[styles.loaderBox, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading catalog...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, backgroundColor: colors.primarySoft, borderColor: colors.border, padding: spacing.md }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>Catalog</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Discover fresh picks and add them to your cart.</Text>
      </View>

      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterRow, { gap: spacing.xs }]}> 
        <Pressable
          style={[
            styles.pill,
            {
              borderRadius: radius.pill,
              borderColor: !categoryFilter ? colors.primary : colors.borderStrong,
              backgroundColor: !categoryFilter ? colors.primarySoft : colors.surface,
              paddingHorizontal: spacing.sm,
              paddingVertical: 7
            }
          ]}
          onPress={() => setCategoryFilter('')}
        >
          <Text style={[styles.pillText, { color: !categoryFilter ? colors.primary : colors.textMuted }]}>All</Text>
        </Pressable>
        {categories.map((category) => (
          <Pressable
            key={category}
            style={[
              styles.pill,
              {
                borderRadius: radius.pill,
                borderColor: categoryFilter === category ? colors.primary : colors.borderStrong,
                backgroundColor: categoryFilter === category ? colors.primarySoft : colors.surface,
                paddingHorizontal: spacing.sm,
                paddingVertical: 7
              }
            ]}
            onPress={() => setCategoryFilter(category)}
          >
            <Text style={[styles.pillText, { color: categoryFilter === category ? colors.primary : colors.textMuted }]}>{category}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.list, { gap: spacing.xs }]}> 
        {filteredProducts.length === 0 ? (
          <View style={[styles.emptyCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md }]}> 
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No products in this category</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Try another filter to see available items.</Text>
          </View>
        ) : null}

        {filteredProducts.map((product) => (
          <View
            key={product.$id}
            style={[
              styles.card,
              {
                borderRadius: radius.lg,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                padding: spacing.sm,
                gap: spacing.xxs
              }
            ]}
          >
            <View style={styles.productHead}>
              <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
              <View
                style={[
                  styles.stockBadge,
                  {
                    borderRadius: radius.pill,
                    backgroundColor: product.stock > 0 ? colors.primarySoft : '#fde2e5',
                    borderColor: product.stock > 0 ? colors.primary : colors.danger
                  }
                ]}
              >
                <Text style={{ color: product.stock > 0 ? colors.primary : colors.danger, fontSize: typography.tiny, fontWeight: '700' }}>
                  {product.stock > 0 ? `Stock ${product.stock}` : 'Out of stock'}
                </Text>
              </View>
            </View>

            <Text style={[styles.meta, { color: colors.textMuted }]}>{product.category || 'No category'}</Text>
            <Text style={[styles.price, { color: colors.primary }]}>{Number(product.price || 0).toFixed(2)} EUR</Text>

            <View style={[styles.row, { gap: spacing.xs, marginTop: spacing.xs }]}> 
              <View style={styles.buttonSlot}>
                <Link href={{ pathname: '/(app)/client/product/[id]', params: { id: product.$id } }} asChild>
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
                    <Text style={[styles.secondaryBtnText, { color: colors.textMuted }]}>Details</Text>
                  </Pressable>
                </Link>
              </View>
              <View style={styles.buttonSlot}>
                <AppButton
                  title="Add"
                  onPress={() => addToCart(product, 1)}
                  disabled={product.stock <= 0}
                  style={styles.fullBtn}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {},
  hero: {
    borderWidth: 1,
    marginBottom: 2
  },
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loaderText: { fontWeight: '600' },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 13 },
  error: { fontWeight: '600' },
  filterRow: { paddingVertical: 4 },
  pill: { borderWidth: 1 },
  pillText: { fontWeight: '700' },
  list: {},
  emptyCard: { borderWidth: 1, alignItems: 'center', gap: 2 },
  emptyTitle: { fontWeight: '700' },
  emptyText: { fontSize: 12 },
  card: {
    borderWidth: 1,
    shadowColor: '#18273b',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2
  },
  productHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  stockBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  productName: { fontSize: 16, fontWeight: '800', flex: 1 },
  meta: { fontSize: 12 },
  price: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  row: { flexDirection: 'row' },
  buttonSlot: { flex: 1 },
  fullBtn: { width: '100%' },
  secondaryBtn: {
    borderWidth: 1,
    alignItems: 'center'
  },
  secondaryBtnText: { fontWeight: '700' }
})
