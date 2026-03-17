import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { useTheme } from '../../theme/ThemeProvider'

export default function AppButton({
  title,
  onPress,
  pending = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle
}) {
  const { colors, radius, spacing } = useTheme()
  const blocked = disabled || pending
  const isGhost = variant === 'ghost'

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: radius.md,
          paddingVertical: spacing.sm,
          backgroundColor: isGhost ? colors.surfaceSoft : colors.primary,
          borderColor: isGhost ? colors.borderStrong : colors.primary,
          opacity: blocked ? 0.65 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }]
        },
        style
      ]}
    >
      {pending ? (
        <ActivityIndicator color={isGhost ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.text, { color: isGhost ? colors.primary : colors.white }, textStyle]}>{title}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1
  },
  text: {
    fontWeight: '700',
    fontSize: 15
  }
})
