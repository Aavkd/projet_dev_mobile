import { StyleSheet, TextInput, View } from 'react-native'
import { useTheme } from '../../theme/ThemeProvider'

export default function AppInput(props) {
  const { colors, radius, spacing } = useTheme()

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: colors.borderStrong,
          borderRadius: radius.md,
          backgroundColor: colors.surfaceSoft,
          paddingHorizontal: spacing.sm
        }
      ]}
    >
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text }]}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1
  },
  input: {
    fontSize: 15,
    paddingVertical: 12
  }
})
