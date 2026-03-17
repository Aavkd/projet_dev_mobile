import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import AppButton from '../../../src/components/ui/AppButton'
import AppInput from '../../../src/components/ui/AppInput'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useTheme } from '../../../src/theme/ThemeProvider'
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
  const { colors, radius, spacing, typography } = useTheme()
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
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.sm }]}> 
      <View style={[styles.hero, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.md }]}> 
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleM }]}>Opening hours</Text>
        <Text style={[styles.heroMeta, { color: colors.textMuted }]}>Set when customers can pick up their orders.</Text>
      </View>

      {DAYS.map((day) => {
        const value = schedule[day.id] || { open_time: '09:00', close_time: '18:00', is_closed: false }

        return (
          <View key={day.id} style={[styles.card, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xs }]}> 
            <Text style={[styles.dayName, { color: colors.text }]}>{day.name}</Text>

            <View style={styles.row}>
              <Text style={[styles.meta, { color: colors.textMuted }]}>Closed</Text>
              <Switch
                value={value.is_closed}
                onValueChange={(next) => updateDay(day.id, 'is_closed', next)}
                thumbColor={value.is_closed ? colors.primary : '#f0f4fb'}
                trackColor={{ false: '#c8d6ea', true: '#9fc0ff' }}
              />
            </View>

            <View style={[styles.rowGap, { gap: spacing.xs }]}> 
              <View style={styles.fieldWrap}>
                <AppInput
                value={value.open_time}
                onChangeText={(next) => updateDay(day.id, 'open_time', next)}
                editable={!value.is_closed}
                placeholder="09:00"
                />
              </View>
              <View style={styles.fieldWrap}>
                <AppInput
                value={value.close_time}
                onChangeText={(next) => updateDay(day.id, 'close_time', next)}
                editable={!value.is_closed}
                placeholder="18:00"
                />
              </View>
            </View>
          </View>
        )
      })}

      <AppButton title={saving ? 'Saving...' : 'Save schedule'} onPress={save} disabled={saving} style={styles.fullBtn} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {},
  hero: { borderWidth: 1 },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  heroMeta: { fontSize: 13 },
  card: {
    borderWidth: 1,
    shadowColor: '#18273b',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 2
  },
  dayName: { fontWeight: '700' },
  meta: { fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowGap: { flexDirection: 'row' },
  fieldWrap: { flex: 1 },
  fullBtn: { width: '100%' }
})
