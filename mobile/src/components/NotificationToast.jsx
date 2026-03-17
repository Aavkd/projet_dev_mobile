import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../theme/ThemeProvider'

export default function NotificationToast({ notifications }) {
  const [toast, setToast] = useState(null)
  const { colors, radius, spacing, typography, shadows } = useTheme()

  useEffect(() => {
    const unread = notifications.filter((item) => !item.read)
    if (!unread.length) return

    const latest = unread[0]
    const ageMs = Date.now() - new Date(latest.$createdAt).getTime()
    if (ageMs > 8000) return

    setToast(latest)
    const timer = setTimeout(() => setToast(null), 4500)
    return () => clearTimeout(timer)
  }, [notifications])

  if (!toast) return null

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { left: spacing.sm, right: spacing.sm, bottom: spacing.lg + 2 }]}>
      <View
        style={[
          styles.container,
          shadows.card,
          {
            borderRadius: radius.lg,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.sm,
            paddingVertical: 10,
            gap: spacing.xs
          }
        ]}
      >
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>New notification</Text>
          <Text style={[styles.message, { color: colors.textMuted, fontSize: typography.caption }]}>{toast.message}</Text>
        </View>
        <Pressable onPress={() => setToast(null)}>
          <Text style={[styles.close, { color: colors.primary }]}>Close</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 1000
  },
  container: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: '#1f6feb'
  },
  content: {
    flex: 1
  },
  title: {
    fontWeight: '700',
    marginBottom: 2
  },
  message: {},
  close: {
    fontWeight: '700'
  }
})
