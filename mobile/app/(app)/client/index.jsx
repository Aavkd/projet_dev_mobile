import { Link, useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import NotificationBell from '../../../src/components/NotificationBell'
import AppButton from '../../../src/components/ui/AppButton'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useCart } from '../../../src/contexts/CartContext'
import { useNotifications } from '../../../src/hooks/useNotifications'
import { useTheme } from '../../../src/theme/ThemeProvider'
import { addressService } from '../../../src/services/addressService'
import { orderService } from '../../../src/services/orderService'

export default function ClientHomeScreen() {
  const router = useRouter()
  const { user, userDoc, logout } = useAuth()
  const { itemCount } = useCart()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const { colors, radius, spacing, typography } = useTheme()
  const [orderCount, setOrderCount] = useState(0)
  const [addressCount, setAddressCount] = useState(0)
  const [recentOrder, setRecentOrder] = useState(null)

  async function onLogout() {
    await logout()
    router.replace('/(auth)/login')
  }

  useEffect(() => {
    let mounted = true
    if (!user?.$id) return

    Promise.all([
      orderService.listOrdersByClient(user.$id),
      addressService.listAddresses(user.$id)
    ])
      .then(([ordersRes, addressesRes]) => {
        if (!mounted) return
        setOrderCount(ordersRes.documents.length)
        setAddressCount(addressesRes.documents.length)
        setRecentOrder(ordersRes.documents[0] || null)
      })
      .catch(() => {
        if (!mounted) return
        setOrderCount(0)
        setAddressCount(0)
        setRecentOrder(null)
      })

    return () => {
      mounted = false
    }
  }, [user])

  const greeting = useMemo(() => userDoc?.name || 'Client', [userDoc])
  const quickActions = [
    { label: 'Catalog', hint: 'Discover fresh picks', path: '/(app)/client/catalog', glyph: 'CA' },
    { label: 'Cart', hint: itemCount > 0 ? `${itemCount} item(s) waiting` : 'Your cart is empty', path: '/(app)/client/cart', glyph: 'CT' },
    { label: 'Orders', hint: orderCount > 0 ? `${orderCount} total order(s)` : 'No order yet', path: '/(app)/client/orders', glyph: 'OR' },
    { label: 'Addresses', hint: addressCount > 0 ? `${addressCount} saved address(es)` : 'Add your first pickup address', path: '/(app)/client/addresses', glyph: 'AD' }
  ]

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.md }]}> 
        <View style={[styles.heroOrbA, { backgroundColor: colors.surface }]} />
        <View style={[styles.heroOrbB, { backgroundColor: '#cfddff' }]} />
        <Text style={[styles.eyebrow, { color: colors.primary }]}>Welcome back</Text>
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleL }]}>Hello, {greeting}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Everything ready for your next pickup.</Text>

        <View style={[styles.kpiRow, { gap: spacing.xs, marginTop: spacing.sm }]}> 
          <View style={[styles.kpiCard, { borderRadius: radius.md, borderColor: colors.borderStrong, backgroundColor: colors.surface, padding: spacing.xs }]}> 
            <Text style={[styles.kpiValue, { color: colors.text }]}>{itemCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>In cart</Text>
          </View>
          <View style={[styles.kpiCard, { borderRadius: radius.md, borderColor: colors.borderStrong, backgroundColor: colors.surface, padding: spacing.xs }]}> 
            <Text style={[styles.kpiValue, { color: colors.text }]}>{orderCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Orders</Text>
          </View>
          <View style={[styles.kpiCard, { borderRadius: radius.md, borderColor: colors.borderStrong, backgroundColor: colors.surface, padding: spacing.xs }]}> 
            <Text style={[styles.kpiValue, { color: colors.text }]}>{unreadCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Alerts</Text>
          </View>
        </View>
      </View>

      <View style={[styles.actionsCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm }]}> 
        <Text style={[styles.cardTitle, { color: colors.text }]}>Quick actions</Text>
        <View style={[styles.actionsWrap, { rowGap: spacing.xs, columnGap: spacing.xs, marginTop: spacing.xs }]}> 
          {quickActions.map((item) => (
            <Link key={item.path} href={item.path} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.actionTile,
                  {
                    borderRadius: radius.md,
                    borderColor: colors.borderStrong,
                    backgroundColor: colors.surfaceSoft,
                    padding: spacing.sm,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.992 : 1 }]
                  }
                ]}
              >
                <View style={[styles.actionBadge, { borderRadius: radius.pill, backgroundColor: colors.primarySoft, borderColor: colors.primary }]}> 
                  <Text style={[styles.actionBadgeText, { color: colors.primary }]}>{item.glyph}</Text>
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.actionHint, { color: colors.textMuted }]}>{item.hint}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>

      <View style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xs }]}> 
        <Text style={[styles.cardTitle, { color: colors.text }]}>Recent order</Text>
        {recentOrder ? (
          <>
            <Text style={[styles.orderId, { color: colors.text }]}>#{recentOrder.$id.slice(-6).toUpperCase()}</Text>
            <Text style={[styles.orderMeta, { color: colors.textMuted }]}>Status: {recentOrder.status}</Text>
            <Text style={[styles.orderMeta, { color: colors.textMuted }]}>Total: {Number(recentOrder.total || 0).toFixed(2)} EUR</Text>
          </>
        ) : (
          <Text style={[styles.orderMeta, { color: colors.textMuted }]}>Your first confirmed order will appear here.</Text>
        )}
      </View>

      <NotificationBell
        unreadCount={unreadCount}
        notifications={notifications}
        onMarkAsRead={markAsRead}
      />

      <AppButton title="Logout" onPress={onLogout} variant="ghost" style={styles.fullBtn} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {},
  hero: { borderWidth: 1, overflow: 'hidden' },
  heroOrbA: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 999,
    right: -52,
    top: -68,
    opacity: 0.35
  },
  heroOrbB: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 999,
    left: -45,
    bottom: -62,
    opacity: 0.36
  },
  eyebrow: { fontWeight: '700', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8 },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 13 },
  kpiRow: { flexDirection: 'row' },
  kpiCard: { borderWidth: 1, flex: 1, alignItems: 'center' },
  kpiValue: { fontSize: 20, fontWeight: '800' },
  kpiLabel: { fontSize: 12, fontWeight: '600' },
  actionsCard: {
    borderWidth: 1,
    shadowColor: '#18273b',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2
  },
  actionsWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionTile: {
    borderWidth: 1,
    width: '48.5%',
    shadowColor: '#18273b',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
    minHeight: 124
  },
  actionBadge: { borderWidth: 1, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, marginBottom: 7 },
  actionBadgeText: { fontSize: 11, fontWeight: '800' },
  actionTitle: { fontWeight: '800', marginBottom: 3 },
  actionHint: { fontSize: 12 },
  card: {
    borderWidth: 1,
    shadowColor: '#18273b',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 4
  },
  orderId: { fontWeight: '800', fontSize: 18 },
  orderMeta: { fontSize: 12 },
  fullBtn: { width: '100%', marginTop: 2 }
})
