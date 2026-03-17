import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import AppButton from '../../src/components/ui/AppButton'
import AppInput from '../../src/components/ui/AppInput'
import AuthShell from '../../src/components/ui/AuthShell'
import { useAuth } from '../../src/contexts/AuthContext'
import { useTheme } from '../../src/theme/ThemeProvider'

export default function RegisterScreen() {
  const router = useRouter()
  const { register } = useAuth()
  const { colors, radius, spacing, typography } = useTheme()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit() {
    setPending(true)
    setError('')

    try {
      await register(name.trim(), email.trim(), password, role)
      router.replace(role === 'merchant' ? '/(app)/merchant' : '/(app)/client')
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell title="Create account" subtitle="Choose your role and start using your space.">
      <View style={styles.stack}>
        <AppInput placeholder="Full name" value={name} onChangeText={setName} />
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

        <View style={styles.roleRow}>
          <Pressable
            style={[
              styles.roleButton,
              {
                borderColor: role === 'client' ? colors.primary : colors.borderStrong,
                borderRadius: radius.md,
                backgroundColor: role === 'client' ? colors.primarySoft : colors.surfaceSoft,
                paddingVertical: spacing.sm
              }
            ]}
            onPress={() => setRole('client')}
          >
            <Text
              style={[
                styles.roleText,
                {
                  color: role === 'client' ? colors.primary : colors.textMuted,
                  fontSize: typography.caption
                }
              ]}
            >
              Client
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.roleButton,
              {
                borderColor: role === 'merchant' ? colors.primary : colors.borderStrong,
                borderRadius: radius.md,
                backgroundColor: role === 'merchant' ? colors.primarySoft : colors.surfaceSoft,
                paddingVertical: spacing.sm
              }
            ]}
            onPress={() => setRole('merchant')}
          >
            <Text
              style={[
                styles.roleText,
                {
                  color: role === 'merchant' ? colors.primary : colors.textMuted,
                  fontSize: typography.caption
                }
              ]}
            >
              Merchant
            </Text>
          </Pressable>
        </View>

        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

        <AppButton title="Register" onPress={onSubmit} pending={pending} />

        <Link href="/(auth)/login" style={[styles.link, { color: colors.primary, fontSize: typography.caption }]}>
          I already have an account
        </Link>
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 12
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center'
  },
  roleText: {
    fontWeight: '600'
  },
  error: {
    fontSize: 13
  },
  link: {
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600'
  }
})
