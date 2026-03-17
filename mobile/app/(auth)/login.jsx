import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { useAuth } from '../../src/contexts/AuthContext'

export default function LoginScreen() {
  const router = useRouter()
  const { login, switchAccount } = useAuth()

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Click & Collect</Text>
        <Text style={styles.subtitle}>Login to continue</Text>
        <Text style={styles.versionTag}>Mobile auth fix v2</Text>

        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={onSubmit} disabled={pending}>
          {pending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>

        <Pressable onPress={() => switchAccount()} disabled={pending}>
          <Text style={styles.link}>Switch account</Text>
        </Pressable>

        <Link href="/(auth)/register" style={styles.link}>
          Create an account
        </Link>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#dbe4f4'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10213a'
  },
  subtitle: {
    fontSize: 14,
    color: '#42526b',
    marginBottom: 8
  },
  versionTag: {
    fontSize: 11,
    color: '#6e7f99',
    marginTop: -8,
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: '#c9d6ea',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fbfdff'
  },
  error: {
    color: '#b42318',
    fontSize: 13
  },
  button: {
    backgroundColor: '#1f6feb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  link: {
    color: '#1f6feb',
    textAlign: 'center',
    marginTop: 4
  }
})
