import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { useAuth } from '../../../src/contexts/AuthContext'
import { scheduleService } from '../../../src/services/scheduleService'

const DAYS = [
  { id: 0, name: 'Monday' },
  { id: 1, name: 'Tuesday' },
  { id: 2, name: 'Wednesday' },
  { id: 3, name: 'Thursday' },
  { id: 4, name: 'Friday' },
  { id: 5, name: 'Saturday' },
  { id: 6, name: 'Sunday' }
]

export default function MerchantScheduleScreen() {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.$id) return

    scheduleService
      .getOpeningHours(user.$id)
      .then((docs) => {
        const next = {}
        docs.forEach((item) => {
          next[item.day_of_week] = {
            open_time: item.open_time,
            close_time: item.close_time,
            is_closed: item.is_closed
          }
        })

        DAYS.forEach((day) => {
          if (!next[day.id]) {
            next[day.id] = { open_time: '09:00', close_time: '18:00', is_closed: false }
          }
        })

        setSchedule(next)
      })
      .catch(() => {})
  }, [user])

  function updateDay(dayId, key, value) {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [key]: value
      }
    }))
  }

  async function save() {
    if (!user?.$id) return
    setSaving(true)

    try {
      for (const day of DAYS) {
        const value = schedule[day.id]
        await scheduleService.upsertOpeningHour(
          user.$id,
          day.id,
          value.open_time,
          value.close_time,
          value.is_closed
        )
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Opening hours</Text>

      {DAYS.map((day) => {
        const value = schedule[day.id] || { open_time: '09:00', close_time: '18:00', is_closed: false }

        return (
          <View key={day.id} style={styles.card}>
            <Text style={styles.dayName}>{day.name}</Text>

            <View style={styles.row}>
              <Text style={styles.meta}>Closed</Text>
              <Switch value={value.is_closed} onValueChange={(next) => updateDay(day.id, 'is_closed', next)} />
            </View>

            <View style={styles.rowGap}>
              <TextInput
                style={[styles.input, value.is_closed && styles.inputDisabled]}
                value={value.open_time}
                onChangeText={(next) => updateDay(day.id, 'open_time', next)}
                editable={!value.is_closed}
                placeholder="09:00"
              />
              <TextInput
                style={[styles.input, value.is_closed && styles.inputDisabled]}
                value={value.close_time}
                onChangeText={(next) => updateDay(day.id, 'close_time', next)}
                editable={!value.is_closed}
                placeholder="18:00"
              />
            </View>
          </View>
        )
      })}

      <Pressable style={[styles.primaryBtn, saving && styles.btnDisabled]} onPress={save} disabled={saving}>
        <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : 'Save schedule'}</Text>
      </Pressable>
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
  dayName: { color: '#10213a', fontWeight: '700' },
  meta: { color: '#576a86' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowGap: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c9d6ea',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fbfdff'
  },
  inputDisabled: { backgroundColor: '#edf1fa', color: '#93a0b5' },
  primaryBtn: { borderRadius: 10, backgroundColor: '#1f6feb', alignItems: 'center', paddingVertical: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { backgroundColor: '#90b4f5' }
})
