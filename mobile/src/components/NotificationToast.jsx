import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function NotificationToast({ notifications }) {
  const [toast, setToast] = useState(null)

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
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.dot} />
        <View style={styles.content}>
          <Text style={styles.title}>New notification</Text>
          <Text style={styles.message}>{toast.message}</Text>
        </View>
        <Pressable onPress={() => setToast(null)}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 22,
    zIndex: 1000
  },
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d4dcf0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
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
    color: '#10213a',
    marginBottom: 2
  },
  message: {
    color: '#42526b',
    fontSize: 12
  },
  close: {
    color: '#1f6feb',
    fontWeight: '600'
  }
})
