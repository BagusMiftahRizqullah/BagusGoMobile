import React, { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert, Linking } from 'react-native'
import Card from '@components/Card'
import Input from '@components/Input'
import Button from '@components/Button'
import Loading from '@components/Loading'
import { Colors } from '@theme/colors'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'
import { login } from '@services/api'
import { useAuthStore } from '@store/auth'
import { Ionicons } from '@expo/vector-icons'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setAuth = useAuthStore((s) => s.setAuth)

  const onSubmit = async (): Promise<void> => {
    setError('')
    setLoading(true)
    try {
      const res = await login({ phone_number: phone, password })
      setAuth(res.token, res.user || null)
      // navigation.replace('Home') - tidak perlu navigasi manual, App.tsx akan auto-switch
    } catch (e: any) {
      console.error('Login error:', e)

      // Handle 403 Subscription expired
      if (e.response && e.response.status === 403) {
        Alert.alert(
          'Langganan Habis',
          'Maaf Trial/Subcribtion kamu sudah habis, harap lakukan Subcribtion kembali',
          [
            { 
              text: 'Subscribe Sekarang', 
              onPress: () => {
                navigation.navigate('Subscription')
              } 
            },
            { text: 'Batal', style: 'cancel' }
          ]
        )
        // Tetap set error message agar user tahu
        setError('Langganan habis. Silakan perbarui langganan Anda.')
      } else {
        const msg = e?.response?.data?.message || e?.message || 'Login gagal'
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Image source={require('../images/Logo.png')} style={styles.logo} resizeMode="contain" />
      <Card style={styles.card}>
        <Input label="Nomor HP / WhatsApp" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Contoh: +62 812-XXXX-XXXX" />
        <Input 
          label="Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry={!showPassword} 
          placeholder="Minimal 6 karakter" 
          style={{ marginTop: 12 }} 
          rightIcon={<Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#888" />}
          onRightIconPress={() => setShowPassword(!showPassword)}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Login" onPress={onSubmit} loading={loading} style={{ marginTop: 16 }} />
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>Belum punya akun? Daftar</Text>

         {/* <Text style={styles.link} onPress={() => navigation.navigate('Subscription')}>Subscribe Sekarang</Text> */}
      </Card>
      {loading ? <Loading /> : null}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.background, justifyContent: 'center' },
  logo: { width: 250, height: 100, alignSelf: 'center', marginBottom: 20 },
  card: {},
  link: { color: Colors.primary, textAlign: 'center', marginTop: 12 },
  error: { color: Colors.danger, marginTop: 8 }
})

export default LoginScreen
