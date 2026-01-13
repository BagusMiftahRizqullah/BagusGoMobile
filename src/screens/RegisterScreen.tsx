import React, { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native'
import Card from '@components/Card'
import Input from '@components/Input'
import Button from '@components/Button'
import { Colors } from '@theme/colors'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'
import { register, login } from '@services/api'
import { useAuthStore } from '@store/auth'

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setAuth = useAuthStore((s) => s.setAuth)

  const onSubmit = async (): Promise<void> => {
    setError('')
    setLoading(true)
    try {
      await register({ phone_number: phone, password })
      const res = await login({ phone_number: phone, password })
      setAuth(res.token, res.user || null)
      navigation.replace('Home')
    } catch {
      setError('Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Image source={require('../images/Logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Daftar</Text>
      <Card>
        <Input label="Nomor HP / WhatsApp" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Contoh: +62 812-XXXX-XXXX" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimal 6 karakter" style={{ marginTop: 12 }} />
        <Text style={styles.info}>Free trial 1 bulan termasuk</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Register" onPress={onSubmit} loading={loading} style={{ marginTop: 16 }} />
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Sudah punya akun? Login</Text>
      </Card>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.background, justifyContent: 'center' },
  logo: { width: 150, height: 80, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 20 },
  info: { color: Colors.textMuted, marginTop: 8 },
  error: { color: Colors.danger, marginTop: 8 },
  link: { color: Colors.primary, textAlign: 'center', marginTop: 12 }
})

export default RegisterScreen
