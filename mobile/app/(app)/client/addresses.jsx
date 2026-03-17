import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useAuth } from '../../../src/contexts/AuthContext'
import { addressService } from '../../../src/services/addressService'

export default function AddressesScreen() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!user?.$id) return
    const response = await addressService.listAddresses(user.$id)
    setAddresses(response.documents)
    setLoading(false)
  }

  useEffect(() => {
    refresh().catch(() => setLoading(false))
  }, [user])

  async function addAddress() {
    if (!label.trim() || !address.trim()) return

    await addressService.createAddress({
      client_id: user.$id,
      label: label.trim(),
      address: address.trim(),
      is_default: addresses.length === 0
    })

    setLabel('')
    setAddress('')
    await refresh()
  }

  async function removeAddress(id) {
    await addressService.deleteAddress(id)
    await refresh()
  }

  async function setDefault(id) {
    await addressService.setDefault(id, user.$id)
    await refresh()
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My addresses</Text>

      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Label (Home, Work...)" value={label} onChangeText={setLabel} />
        <TextInput style={styles.input} placeholder="Full address" value={address} onChangeText={setAddress} />
        <Pressable style={styles.primaryBtn} onPress={addAddress}>
          <Text style={styles.primaryBtnText}>Add address</Text>
        </Pressable>
      </View>

      {!loading && addresses.length === 0 ? <Text style={styles.meta}>No addresses yet</Text> : null}

      {addresses.map((item) => (
        <View key={item.$id} style={[styles.card, item.is_default && styles.defaultCard]}>
          <Text style={styles.itemName}>{item.label}</Text>
          <Text style={styles.meta}>{item.address}</Text>
          <View style={styles.row}>
            {!item.is_default ? (
              <Pressable onPress={() => setDefault(item.$id)}>
                <Text style={styles.link}>Set default</Text>
              </Pressable>
            ) : (
              <Text style={styles.defaultTag}>Default</Text>
            )}
            <Pressable onPress={() => removeAddress(item.$id)}>
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
  title: { fontSize: 24, fontWeight: '700', color: '#10213a' },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbe4f4',
    borderRadius: 12,
    padding: 12,
    gap: 8
  },
  defaultCard: { borderColor: '#1f6feb' },
  input: {
    borderWidth: 1,
    borderColor: '#c9d6ea',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fbfdff'
  },
  itemName: { color: '#10213a', fontWeight: '700' },
  meta: { color: '#576a86' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  link: { color: '#1f6feb', fontWeight: '600' },
  defaultTag: { color: '#1f6feb', fontWeight: '700' },
  remove: { color: '#b42318', fontWeight: '600' },
  primaryBtn: { borderRadius: 10, backgroundColor: '#1f6feb', alignItems: 'center', paddingVertical: 11 },
  primaryBtnText: { color: '#fff', fontWeight: '700' }
})
