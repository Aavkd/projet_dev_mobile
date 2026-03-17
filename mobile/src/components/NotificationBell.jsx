import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../theme/ThemeProvider'

export default function NotificationBell({ unreadCount, notifications, onMarkAsRead }) {
  const [isOpen, setIsOpen] = useState(false)
  const { colors, radius, spacing, typography, shadows } = useTheme()

  return (
    <View>
      <Pressable
        style={[
          styles.bell,
          {
            borderColor: colors.borderStrong,
            borderRadius: radius.md,
            paddingHorizontal: spacing.sm,
            paddingVertical: 8,
            backgroundColor: colors.surface
          }
        ]}
        onPress={() => setIsOpen((prev) => !prev)}
      >
        <Text style={[styles.bellText, { color: colors.text }]}>Notifications</Text>
        {unreadCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        ) : null}
      </Pressable>

      {isOpen ? (
        <View
          style={[
            styles.panel,
            shadows.card,
            {
              marginTop: spacing.xs,
              borderColor: colors.border,
              borderRadius: radius.lg,
              backgroundColor: colors.surface,
              padding: spacing.xs
            }
          ]}
        >
          <ScrollView style={{ maxHeight: 280 }}>
            {notifications.length === 0 ? (
              <Text style={[styles.empty, { color: colors.textMuted }]}>No notifications</Text>
            ) : (
              notifications.map((item) => (
                <View
                  key={item.$id}
                  style={[
                    styles.row,
                    {
                      borderBottomColor: colors.border
                    },
                    !item.read && {
                      backgroundColor: colors.primarySoft,
                      borderRadius: radius.sm,
                      paddingHorizontal: spacing.xs
                    }
                  ]}
                >
                  <Text style={[styles.msg, { color: colors.text, fontSize: typography.caption }]}>{item.message}</Text>
                  <View style={styles.rowFooter}>
                    <Text style={[styles.date, { color: colors.textMuted }]}>{new Date(item.$createdAt).toLocaleString()}</Text>
                    {!item.read ? (
                      <Pressable onPress={() => onMarkAsRead(item.$id)}>
                        <Text style={[styles.mark, { color: colors.primary }]}>Mark read</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  bell: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bellText: {
    fontWeight: '600'
  },
  badge: {
    minWidth: 20,
    borderRadius: 999,
    backgroundColor: '#d92d20',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12
  },
  panel: {
    borderWidth: 1,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 12
  },
  row: {
    borderBottomWidth: 1,
    paddingVertical: 8
  },
  msg: {},
  rowFooter: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  date: {
    fontSize: 11
  },
  mark: {
    fontWeight: '600',
    fontSize: 12
  }
})
