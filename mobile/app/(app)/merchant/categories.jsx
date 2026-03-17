import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useAuth } from '../../../src/contexts/AuthContext'
import { categoryService } from '../../../src/services/categoryService'

export default function MerchantCategoriesScreen() {
  const { user } = useAuth()
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Categories</Text>

      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="New category" value={name} onChangeText={setName} />
        <Pressable style={styles.primaryBtn} onPress={addCategory}>
          <Text style={styles.primaryBtnText}>Add</Text>
        </Pressable>
      </View>

      {categories.map((item) => (
        <View key={item.$id} style={styles.cardRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Pressable onPress={() => removeCategory(item.$id)}>
            <Text style={styles.remove}>Delete</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: '700', color: '#10213a' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dbe4f4', borderRadius: 12, padding: 12, gap: 8 },
  input: { borderWidth: 1, borderColor: '#c9d6ea', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fbfdff' },
  primaryBtn: { borderRadius: 10, backgroundColor: '#1f6feb', alignItems: 'center', paddingVertical: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  cardRow: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbe4f4',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemName: { color: '#10213a', fontWeight: '700' },
  remove: { color: '#b42318', fontWeight: '600' }
})
