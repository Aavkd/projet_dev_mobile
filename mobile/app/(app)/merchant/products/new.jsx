import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { useAuth } from '../../../../src/contexts/AuthContext'
import { categoryService } from '../../../../src/services/categoryService'
import { productService } from '../../../../src/services/productService'

export default function ProductCreateScreen() {
  const router = useRouter()
  const { user } = useAuth()

  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [category, setCategory] = useState('')
  const [available, setAvailable] = useState(true)
  const [imageUri, setImageUri] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.$id) return
    categoryService.listCategories(user.$id).then((response) => setCategories(response.documents)).catch(() => {})
  }, [user])

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    })

    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
    }
  }

  async function save() {
    if (!name.trim() || !price || !category) return
    setSaving(true)

    try {
      let imageId = ''
      if (imageUri) {
        const upload = await productService.uploadImage(imageUri, `${Date.now()}.jpg`, 'image/jpeg')
        imageId = upload.$id
      }

      await productService.createProduct({
        name: name.trim(),
        price: Number(price),
        category,
        stock: Number(stock || 0),
        available,
        merchant_id: user.$id,
        image_id: imageId
      })

      router.replace('/(app)/merchant/products')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New product</Text>

      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Price" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
        <TextInput style={styles.input} placeholder="Stock" keyboardType="number-pad" value={stock} onChangeText={setStock} />

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.wrapRow}>
          {categories.map((item) => (
            <Pressable
              key={item.$id}
              style={[styles.pill, category === item.name && styles.pillActive]}
              onPress={() => setCategory(item.name)}
            >
              <Text style={[styles.pillText, category === item.name && styles.pillTextActive]}>{item.name}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.sectionTitle}>Available</Text>
          <Switch value={available} onValueChange={setAvailable} />
        </View>

        <Pressable style={styles.secondaryBtn} onPress={pickImage}>
          <Text style={styles.secondaryBtnText}>{imageUri ? 'Image selected' : 'Pick image'}</Text>
        </Pressable>

        <Pressable style={[styles.primaryBtn, saving && styles.btnDisabled]} onPress={save} disabled={saving}>
          <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : 'Create product'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#10213a', marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbe4f4',
    borderRadius: 12,
    padding: 12,
    gap: 9
  },
  input: {
    borderWidth: 1,
    borderColor: '#c9d6ea',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fbfdff'
  },
  sectionTitle: { color: '#10213a', fontWeight: '700' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { borderWidth: 1, borderColor: '#c9d6ea', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pillActive: { backgroundColor: '#1f6feb', borderColor: '#1f6feb' },
  pillText: { color: '#42526b', fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  primaryBtn: { borderRadius: 10, backgroundColor: '#1f6feb', alignItems: 'center', paddingVertical: 11 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { borderRadius: 10, borderWidth: 1, borderColor: '#c9d6ea', alignItems: 'center', paddingVertical: 10 },
  secondaryBtnText: { color: '#1f6feb', fontWeight: '600' },
  btnDisabled: { backgroundColor: '#90b4f5' }
})
