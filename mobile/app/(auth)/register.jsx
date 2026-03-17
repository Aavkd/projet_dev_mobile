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

export default function RegisterScreen() {
  const router = useRouter()
  const { register } = useAuth()

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create account</Text>

        <TextInput placeholder="Full name" style={styles.input} value={name} onChangeText={setName} />
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

        <View style={styles.roleRow}>
          <Pressable
            style={[styles.roleButton, role === 'client' && styles.roleButtonActive]}
            onPress={() => setRole('client')}
          >
            <Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>Client</Text>
          </Pressable>
          <Pressable
            style={[styles.roleButton, role === 'merchant' && styles.roleButtonActive]}
            onPress={() => setRole('merchant')}
          >
            <Text style={[styles.roleText, role === 'merchant' && styles.roleTextActive]}>Merchant</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={onSubmit} disabled={pending}>
          {pending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </Pressable>

        <Link href="/(auth)/login" style={styles.link}>
          I already have an account
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
    fontSize: 24,
    fontWeight: '700',
    color: '#10213a',
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
  roleRow: {
    flexDirection: 'row',
    gap: 10
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c9d6ea',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  roleButtonActive: {
    backgroundColor: '#1f6feb',
    borderColor: '#1f6feb'
  },
  roleText: {
    color: '#42526b',
    fontWeight: '600'
  },
  roleTextActive: {
    color: '#ffffff'
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
