import { Link } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../../../../src/lib/env'
import { useAuth } from '../../../../src/contexts/AuthContext'
import { useTheme } from '../../../../src/theme/ThemeProvider'
import { productService } from '../../../../src/services/productService'
import { useRealtime } from '../../../../src/hooks/useRealtime'

export default function MerchantProductsScreen() {
  const { user } = useAuth()
  const { colors, radius, spacing, typography } = useTheme()
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
      <View style={[styles.loaderBox, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading products...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.md }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>Products</Text>
        <Text style={[styles.heroMeta, { color: colors.textMuted }]}>Manage your catalog and product availability.</Text>
      </View>

      <Link href="/(app)/merchant/products/new" asChild>
        <Pressable
          style={[
            styles.addBtn,
            {
              width: '100%',
              borderRadius: radius.md,
              borderColor: colors.primary,
              backgroundColor: colors.primary,
              paddingVertical: spacing.sm
            }
          ]}
        >
          <Text style={styles.addBtnText}>Add product</Text>
        </Pressable>
      </Link>

      {products.length === 0 ? (
        <View style={[styles.emptyCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md }]}> 
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No products yet</Text>
          <Text style={[styles.emptyMeta, { color: colors.textMuted }]}>Add your first item to start selling.</Text>
        </View>
      ) : null}

      {products.map((item) => (
        <View key={item.$id} style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xxs }]}> 
          <View style={styles.topRow}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            <View
              style={[
                styles.availChip,
                {
                  borderRadius: radius.pill,
                  borderColor: item.available ? '#9fd8bf' : '#f0c981',
                  backgroundColor: item.available ? '#e7f7ef' : '#fff2dc'
                }
              ]}
            >
              <Text style={{ color: item.available ? '#17784f' : '#a05f0a', fontWeight: '700', fontSize: 11 }}>{item.available ? 'available' : 'paused'}</Text>
            </View>
          </View>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Category: {item.category || 'N/A'}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Price: {Number(item.price || 0).toFixed(2)} EUR</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Stock: {item.stock}</Text>

          <View style={[styles.row, { marginTop: spacing.xs }]}> 
            <Link href={{ pathname: '/(app)/merchant/products/[id]', params: { id: item.$id } }} asChild>
              <Pressable>
                <Text style={[styles.link, { color: colors.primary }]}>Edit</Text>
              </Pressable>
            </Link>
            <Pressable onPress={() => removeProduct(item.$id)}>
              <Text style={[styles.remove, { color: colors.danger }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {},
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loaderText: { fontWeight: '600' },
  hero: { borderWidth: 1 },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  heroMeta: { fontSize: 13 },
  addBtn: { borderWidth: 1, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyCard: { borderWidth: 1, alignItems: 'center', gap: 2 },
  emptyTitle: { fontWeight: '700' },
  emptyMeta: { fontSize: 12 },
  card: {
    borderWidth: 1,
    shadowColor: '#18273b',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  availChip: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  itemName: { fontWeight: '800', fontSize: 16, flex: 1 },
  meta: { fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { fontWeight: '700' },
  remove: { fontWeight: '700' }
})
