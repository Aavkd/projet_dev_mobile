import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import AppButton from '../../../src/components/ui/AppButton'
import AppInput from '../../../src/components/ui/AppInput'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useTheme } from '../../../src/theme/ThemeProvider'
import { addressService } from '../../../src/services/addressService'

export default function AddressesScreen() {
  const { user } = useAuth()
  const { colors, radius, spacing, typography } = useTheme()
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
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.md }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>My addresses</Text>
        <Text style={[styles.heroMeta, { color: colors.textMuted }]}>Pick where your order should be ready.</Text>
      </View>

      <View style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xs }]}> 
        <AppInput placeholder="Label (Home, Work...)" value={label} onChangeText={setLabel} />
        <AppInput placeholder="Full address" value={address} onChangeText={setAddress} />
        <AppButton title="Add address" onPress={addAddress} style={styles.fullBtn} />
      </View>

      {!loading && addresses.length === 0 ? (
        <View style={[styles.emptyCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md }]}> 
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No addresses yet</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Add your first pickup address above.</Text>
        </View>
      ) : null}

      {addresses.map((item) => (
        <View
          key={item.$id}
          style={[
            styles.card,
            {
              borderRadius: radius.lg,
              borderColor: item.is_default ? colors.primary : colors.border,
              backgroundColor: item.is_default ? colors.primarySoft : colors.surface,
              padding: spacing.sm,
              gap: spacing.xxs
            }
          ]}
        >
          <Text style={[styles.itemName, { color: colors.text }]}>{item.label}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{item.address}</Text>
          <View style={styles.row}>
            {!item.is_default ? (
              <Pressable onPress={() => setDefault(item.$id)}>
                <Text style={[styles.link, { color: colors.primary }]}>Set default</Text>
              </Pressable>
            ) : (
              <Text style={[styles.defaultTag, { color: colors.primary }]}>Default</Text>
            )}
            <Pressable onPress={() => removeAddress(item.$id)}>
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
  hero: { borderWidth: 1 },
  heroMeta: { fontSize: 13 },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  card: { borderWidth: 1 },
  fullBtn: { width: '100%' },
  emptyCard: { borderWidth: 1, alignItems: 'center', gap: 2 },
  emptyTitle: { fontWeight: '700' },
  itemName: { fontWeight: '700' },
  meta: { fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  link: { fontWeight: '700' },
  defaultTag: { fontWeight: '800' },
  remove: { fontWeight: '700' }
})
