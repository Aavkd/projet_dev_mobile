import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import AppButton from '../../src/components/ui/AppButton'
import AppInput from '../../src/components/ui/AppInput'
import AuthShell from '../../src/components/ui/AuthShell'
import { useAuth } from '../../src/contexts/AuthContext'
import { useTheme } from '../../src/theme/ThemeProvider'

export default function LoginScreen() {
  const router = useRouter()
  const { login, switchAccount } = useAuth()
  const { colors, typography } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit() {
    setPending(true)
    setError('')

    try {
      const doc = await login(email.trim(), password)
      router.replace(doc.role === 'merchant' ? '/(app)/merchant' : '/(app)/client')
    } catch (err) {
      setError(err?.message || 'Login failed. Check your credentials.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell title="Click & Collect" subtitle="Login to continue and pick up faster.">
      <View style={styles.formStack}>
        <AppInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />

        <AppInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

        <AppButton title="Login" onPress={onSubmit} pending={pending} />

        <Pressable style={styles.centerRow} onPress={() => switchAccount()} disabled={pending}>
          <Text style={[styles.link, { color: colors.primary, fontSize: typography.caption }]}>Switch account</Text>
        </Pressable>

        <Link href="/(auth)/register" style={[styles.link, { color: colors.primary, fontSize: typography.caption }]}>
          Create an account
        </Link>
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  formStack: {
    gap: 12
  },
  error: {
    fontSize: 13
  },
  centerRow: {
    alignItems: 'center'
  },
  link: {
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600'
  }
})
