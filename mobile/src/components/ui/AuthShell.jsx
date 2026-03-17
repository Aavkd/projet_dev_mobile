import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../../theme/ThemeProvider'

export default function AuthShell({ title, subtitle, children }) {
  const { colors, radius, spacing, typography, shadows } = useTheme()

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}
    >
      <View style={styles.bgBlobTop} />
      <View style={styles.bgBlobBottom} />
      <View
        style={[
          styles.card,
          shadows.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
            gap: spacing.sm
          }
        ]}
      >
        <Text style={[styles.title, { color: colors.text, fontSize: typography.titleL }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        {children}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  card: {
    borderWidth: 1
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.4
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4
  },
  bgBlobTop: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
    top: -100,
    right: -80,
    backgroundColor: '#cde0ff'
  },
  bgBlobBottom: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 999,
    bottom: -110,
    left: -80,
    backgroundColor: '#d9e9ff'
  }
})
