import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function NotificationBell({ unreadCount, notifications, onMarkAsRead }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <View>
      <Pressable style={styles.bell} onPress={() => setIsOpen((prev) => !prev)}>
        <Text style={styles.bellText}>Notifications</Text>
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        ) : null}
      </Pressable>

      {isOpen ? (
        <View style={styles.panel}>
          <ScrollView style={{ maxHeight: 280 }}>
            {notifications.length === 0 ? (
              <Text style={styles.empty}>No notifications</Text>
            ) : (
              notifications.map((item) => (
                <View key={item.$id} style={[styles.row, !item.read && styles.rowUnread]}>
                  <Text style={styles.msg}>{item.message}</Text>
                  <View style={styles.rowFooter}>
                    <Text style={styles.date}>{new Date(item.$createdAt).toLocaleString()}</Text>
                    {!item.read ? (
                      <Pressable onPress={() => onMarkAsRead(item.$id)}>
                        <Text style={styles.mark}>Mark read</Text>
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
    borderColor: '#c9d6ea',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bellText: {
    color: '#10213a',
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
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d4dcf0',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 8
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 12,
    color: '#6e7f99'
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#edf1fa',
    paddingVertical: 8
  },
  rowUnread: {
    backgroundColor: '#f1f6ff'
  },
  msg: {
    color: '#10213a',
    fontSize: 13
  },
  rowFooter: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  date: {
    color: '#6e7f99',
    fontSize: 11
  },
  mark: {
    color: '#1f6feb',
    fontWeight: '600',
    fontSize: 12
  }
})
