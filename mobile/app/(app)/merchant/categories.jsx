import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import AppButton from '../../../src/components/ui/AppButton'
import AppInput from '../../../src/components/ui/AppInput'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useTheme } from '../../../src/theme/ThemeProvider'
import { categoryService } from '../../../src/services/categoryService'

export default function MerchantCategoriesScreen() {
  const { user } = useAuth()
  const { colors, radius, spacing, typography } = useTheme()
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')

  async function refresh() {
    if (!user?.$id) return
    const response = await categoryService.listCategories(user.$id)
    setCategories(response.documents)
  }

  useEffect(() => {
    refresh().catch(() => {})
  }, [user])

  async function addCategory() {
    if (!name.trim()) return
    await categoryService.createCategory({ name: name.trim(), merchant_id: user.$id })
    setName('')
    await refresh()
  }

  async function removeCategory(id) {
    await categoryService.deleteCategory(id)
    await refresh()
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.md }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>Categories</Text>
        <Text style={[styles.heroMeta, { color: colors.textMuted }]}>Organize your products with clear category groups.</Text>
      </View>

      <View style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xs }]}> 
        <AppInput placeholder="New category" value={name} onChangeText={setName} />
        <AppButton title="Add" onPress={addCategory} style={styles.fullBtn} />
      </View>

      {categories.length === 0 ? (
        <View style={[styles.emptyCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md }]}> 
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No categories yet</Text>
          <Text style={[styles.emptyMeta, { color: colors.textMuted }]}>Create a category to structure your catalog.</Text>
        </View>
      ) : null}

      {categories.map((item) => (
        <View key={item.$id} style={[styles.cardRow, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm }]}> 
          <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
          <Pressable onPress={() => removeCategory(item.$id)}>
            <Text style={[styles.remove, { color: colors.danger }]}>Delete</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {},
  hero: { borderWidth: 1 },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  heroMeta: { fontSize: 13 },
  card: { borderWidth: 1 },
  fullBtn: { width: '100%' },
  emptyCard: { borderWidth: 1, alignItems: 'center', gap: 2 },
  emptyTitle: { fontWeight: '700' },
  emptyMeta: { fontSize: 12 },
  cardRow: {
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#18273b',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 2
  },
  itemName: { fontWeight: '700' },
  remove: { fontWeight: '700' }
})
