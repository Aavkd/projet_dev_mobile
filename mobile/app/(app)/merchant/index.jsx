import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import NotificationBell from '../../../src/components/NotificationBell'
import AppButton from '../../../src/components/ui/AppButton'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useNotifications } from '../../../src/hooks/useNotifications'
import { useTheme } from '../../../src/theme/ThemeProvider'
import { statsService } from '../../../src/services/statsService'

export default function MerchantHomeScreen() {
  const router = useRouter()
  const { user, userDoc, logout } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const { colors, radius, spacing, typography } = useTheme()
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  async function onLogout() {
    await logout()
    router.replace('/(auth)/login')
  }

  useEffect(() => {
    let mounted = true
    if (!user?.$id) return

    statsService
      .getMerchantStats(user.$id)
      .then((data) => {
        if (!mounted) return
        setStats(data)
      })
      .catch(() => {
        if (!mounted) return
        setStats(null)
      })
      .finally(() => {
        if (!mounted) return
        setLoadingStats(false)
      })

    return () => {
      mounted = false
    }
  }, [user])

  const pendingCount = stats?.ordersByStatus?.pending || 0
  const readyCount = stats?.ordersByStatus?.ready || 0
  const doneCount = stats?.ordersByStatus?.done || 0
  const revenue = Number(stats?.revenue || 0).toFixed(2)

  const quickActions = [
    {
      label: 'Dashboard',
      hint: `Revenue EUR ${revenue}`,
      path: '/(app)/merchant/dashboard',
      glyph: 'DB'
    },
    {
      label: 'Products',
      hint: 'Update catalog and stock',
      path: '/(app)/merchant/products',
      glyph: 'PR'
    },
    {
      label: 'Categories',
      hint: 'Keep your sections tidy',
      path: '/(app)/merchant/categories',
      glyph: 'CA'
    },
    {
      label: 'Order history',
      hint: 'Review completed pickups',
      path: '/(app)/merchant/orders-history',
      glyph: 'OH'
    },
    {
      label: 'Opening hours',
      hint: 'Set weekly availability',
      path: '/(app)/merchant/schedule',
      glyph: 'OP'
    }
  ]

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}
    >
      <View
        style={[
          styles.hero,
          {
            borderRadius: radius.lg,
            borderColor: colors.border,
            backgroundColor: colors.primarySoft,
            padding: spacing.md
          }
        ]}
      >
        <View style={[styles.heroOrbA, { backgroundColor: colors.surface }]} />
        <View style={[styles.heroOrbB, { backgroundColor: '#d0e0ff' }]} />
        <Text style={[styles.eyebrow, { color: colors.primary }]}>Control room</Text>
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleL }]}>Merchant space</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Welcome {userDoc?.name || 'Merchant'}</Text>
        <Text style={[styles.heroHint, { color: colors.textMuted }]}>Track operations and jump to key tools instantly.</Text>

        {loadingStats ? (
          <View style={[styles.loadingRow, { marginTop: spacing.xs }]}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading live stats...</Text>
          </View>
        ) : (
          <View style={[styles.kpiRow, { gap: spacing.xs, marginTop: spacing.sm }]}>
            <View
              style={[
                styles.kpiCard,
                {
                  borderRadius: radius.md,
                  borderColor: colors.borderStrong,
                  backgroundColor: colors.surface,
                  padding: spacing.xs
                }
              ]}
            >
              <Text style={[styles.kpiValue, { color: colors.text }]}>{pendingCount}</Text>
              <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Pending</Text>
            </View>
            <View
              style={[
                styles.kpiCard,
                {
                  borderRadius: radius.md,
                  borderColor: colors.borderStrong,
                  backgroundColor: colors.surface,
                  padding: spacing.xs
                }
              ]}
            >
              <Text style={[styles.kpiValue, { color: colors.text }]}>{readyCount}</Text>
              <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Ready</Text>
            </View>
            <View
              style={[
                styles.kpiCard,
                {
                  borderRadius: radius.md,
                  borderColor: colors.borderStrong,
                  backgroundColor: colors.surface,
                  padding: spacing.xs
                }
              ]}
            >
              <Text style={[styles.kpiValue, { color: colors.text }]}>{doneCount}</Text>
              <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Done</Text>
            </View>
          </View>
        )}
      </View>

      <View
        style={[
          styles.highPriority,
          {
            borderRadius: radius.lg,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            padding: spacing.sm
          }
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Priority now</Text>
        <Pressable
          onPress={() => router.push('/(app)/merchant/orders')}
          style={({ pressed }) => [
            styles.priorityAction,
            {
              borderRadius: radius.md,
              borderColor: colors.primary,
              backgroundColor: colors.primarySoft,
              padding: spacing.sm,
              opacity: pressed ? 0.86 : 1,
              transform: [{ scale: pressed ? 0.994 : 1 }]
            }
          ]}
        >
          <View style={styles.priorityMain}>
            <View>
              <Text style={[styles.priorityTitle, { color: colors.text }]}>Order queue</Text>
              <Text style={[styles.priorityMeta, { color: colors.textMuted }]}>
                {pendingCount > 0 ? `${pendingCount} order(s) waiting` : 'No pending order right now'}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.primary }]}>{'>'}</Text>
          </View>
        </Pressable>
      </View>

      <View
        style={[
          styles.actionsCard,
          {
            borderRadius: radius.lg,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            padding: spacing.sm
          }
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick actions</Text>
        <View style={[styles.actionsWrap, { rowGap: spacing.xs, columnGap: spacing.xs, marginTop: spacing.xs }]}> 
          {quickActions.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.path)}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  borderRadius: radius.md,
                  borderColor: index === 0 ? colors.primary : colors.borderStrong,
                  backgroundColor: index === 0 ? colors.primarySoft : colors.surfaceSoft,
                  padding: spacing.sm,
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.996 : 1 }]
                }
              ]}
            >
              <View style={styles.actionTextWrap}>
                <View style={[styles.actionBadge, { borderRadius: radius.pill, backgroundColor: colors.surface, borderColor: colors.borderStrong }]}> 
                  <Text style={[styles.actionBadgeText, { color: colors.primary }]}>{item.glyph}</Text>
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.actionHint, { color: colors.textMuted }]}>{item.hint}</Text>
              </View>
            </Pressable>
          ))}
        </View>
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
    width: 180,
    height: 180,
    borderRadius: 999,
    right: -50,
    top: -70,
    opacity: 0.35
  },
  heroOrbB: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 999,
    left: -55,
    bottom: -75,
    opacity: 0.4
  },
  eyebrow: { fontWeight: '700', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8 },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 13 },
  heroHint: { fontSize: 12, marginTop: 4 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 12, fontWeight: '600' },
  kpiRow: { flexDirection: 'row' },
  kpiCard: { borderWidth: 1, flex: 1, alignItems: 'center' },
  kpiValue: { fontSize: 20, fontWeight: '800' },
  kpiLabel: { fontSize: 12, fontWeight: '600' },
  highPriority: {
    borderWidth: 1,
    gap: 8,
    shadowColor: '#18273b',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2
  },
  sectionTitle: { fontWeight: '800' },
  priorityAction: { borderWidth: 1 },
  priorityMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priorityTitle: { fontWeight: '800', marginBottom: 2 },
  priorityMeta: { fontSize: 12 },
  actionsCard: {
    borderWidth: 1,
    shadowColor: '#18273b',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2
  },
  actionsWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButton: {
    borderWidth: 1,
    width: '48.5%',
    shadowColor: '#18273b',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
    minHeight: 132
  },
  actionTextWrap: { flex: 1 },
  actionBadge: { borderWidth: 1, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, marginBottom: 7 },
  actionBadgeText: { fontSize: 11, fontWeight: '800' },
  actionTitle: { fontWeight: '800', marginBottom: 2 },
  actionHint: { fontSize: 12 },
  chevron: { fontSize: 22, fontWeight: '700' },
  fullBtn: { width: '100%', marginTop: 2 }
})
