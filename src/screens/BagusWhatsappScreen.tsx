import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'
import { Colors } from '@theme/colors'
import Input from '@components/Input'
import Button from '@components/Button'
import Loading from '@components/Loading'

type Props = NativeStackScreenProps<RootStackParamList, 'BagusWhatsapp'>

const BagusWhatsappScreen: React.FC<Props> = () => {
  const insets = useSafeAreaInsets()
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const trimmedPhone = useMemo(() => phone.replace(/[^0-9]/g, ''), [phone])
  const isPhoneValid = useMemo(() => {
    if (trimmedPhone.length < 8) {
      return false
    }
    if (trimmedPhone.startsWith('0')) {
      return trimmedPhone.length >= 9
    }
    if (trimmedPhone.startsWith('62')) {
      return trimmedPhone.length >= 11
    }
    return false
  }, [trimmedPhone])

  const isMessageValid = useMemo(() => message.trim().length > 0, [message])

  const buildInternationalPhone = useCallback(() => {
    if (trimmedPhone.startsWith('62')) {
      return trimmedPhone
    }
    if (trimmedPhone.startsWith('0')) {
      return `62${trimmedPhone.substring(1)}`
    }
    return trimmedPhone
  }, [trimmedPhone])

  const handleSend = useCallback(async () => {
    if (!isPhoneValid) {
      Alert.alert('Nomor tidak valid', 'Pastikan nomor WhatsApp sudah benar')
      return
    }

    if (!isMessageValid) {
      Alert.alert('Pesan kosong', 'Isi pesan sebelum mengirim')
      return
    }

    const phoneForWhatsapp = buildInternationalPhone()
    const encodedMessage = encodeURIComponent(message)
    const primaryUrl = `whatsapp://send?phone=${phoneForWhatsapp}&text=${encodedMessage}`
    const fallbackUrl = `https://wa.me/${phoneForWhatsapp}?text=${encodedMessage}`

    setLoading(true)
    try {
      await Linking.openURL(primaryUrl)
    } catch (e) {
      try {
        await Linking.openURL(fallbackUrl)
      } catch (err) {
        Alert.alert('WhatsApp tidak tersedia', 'Pastikan WhatsApp terpasang di perangkat Anda')
      }
    } finally {
      setLoading(false)
    }
  }, [buildInternationalPhone, isMessageValid, isPhoneValid, message])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingBottom: 20 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>BagusWhatsapp</Text>
          <Text style={styles.subtitle}>Kirim pesan WhatsApp dengan cepat</Text>

          <Input
            label="Nomor WhatsApp"
            value={phone}
            onChangeText={setPhone}
            placeholder="Contoh: 081234567890 atau 62XXXXXXXXXX"
            keyboardType="phone-pad"
            style={styles.input}
          />
          {!isPhoneValid && phone.length > 0 ? (
            <Text style={styles.errorText}>Nomor WhatsApp tidak valid</Text>
          ) : null}

          <View style={styles.messageContainer}>
            <Text style={styles.label}>Pesan</Text>
            <View style={styles.textAreaContainer}>
              <Input
                value={message}
                onChangeText={setMessage}
                placeholder="Tulis pesan WhatsApp Anda di sini"
                style={styles.textAreaInput}
              />
            </View>
            {!isMessageValid && message.length === 0 ? (
              <Text style={styles.errorText}>Pesan tidak boleh kosong</Text>
            ) : null}
          </View>

          <Button
            label="Send"
            onPress={handleSend}
            style={styles.sendButton}
            disabled={!isPhoneValid || !isMessageValid || loading}
            loading={loading}
          />
        </ScrollView>
        {loading ? <Loading fullscreen={false} style={styles.inlineLoading} /> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  input: {
    marginBottom: 4,
  },
  messageContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  textAreaInput: {
    height: 140,
  },
  sendButton: {
    marginTop: 4,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  inlineLoading: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
})

export default BagusWhatsappScreen
