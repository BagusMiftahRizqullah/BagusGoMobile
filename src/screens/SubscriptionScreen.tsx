import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'
import { Colors } from '@theme/colors'
import Card from '@components/Card'
import Input from '@components/Input'
import Button from '@components/Button'
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'

type Props = NativeStackScreenProps<RootStackParamList, 'Subscription'>

const PLANS = [
  { id: 'monthly', name: 'Bulanan', price: 'Rp 99.000', duration: '30 Hari' },
  { id: 'yearly', name: 'Tahunan', price: 'Rp 1.200.000', duration: '365 Hari' },
]

const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0])
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  
  const handleWhatsApp = () => {
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert('Mohon lengkapi data', 'Nama dan Nomor HP diperlukan untuk aktivasi akun.')
      return
    }

    const message = `Halo Admin BagusGo, saya ingin aktivasi berlangganan.

Plan: ${selectedPlan.name} (${selectedPlan.price})
Nama: ${name}
No HP: ${phoneNumber}

Berikut bukti transfer saya:`

    const url = `whatsapp://send?phone=6281289602462&text=${encodeURIComponent(message)}`
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Gagal membuka WhatsApp', 'Pastikan aplikasi WhatsApp terinstal di perangkat Anda.')
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Pilih Paket Langganan</Text>
        <Text style={styles.subtitle}>Nikmati fitur optimasi rute tanpa batas!</Text>

        <View style={styles.plansContainer}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan.id === plan.id
            return (
              <TouchableOpacity 
                key={plan.id} 
                activeOpacity={0.8}
                onPress={() => setSelectedPlan(plan)}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
              >
                <View style={styles.planHeader}>
                  <Text style={[styles.planName, isSelected && styles.textSelected]}>{plan.name}</Text>
                </View>
                <Text style={[styles.planPrice, isSelected && styles.textSelected]}>{plan.price}</Text>
                <Text style={[styles.planDuration, isSelected && styles.textSelected]}>per {plan.duration}</Text>
                
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Data Pendaftar</Text>
          <Input 
            label="Nama Lengkap" 
            placeholder="Nama Anda" 
            value={name} 
            onChangeText={setName} 
          />
          <Input 
            label="Nomor HP Terdaftar" 
            placeholder="Contoh: 081234567890" 
            value={phoneNumber} 
            onChangeText={setPhoneNumber} 
            keyboardType="phone-pad"
            style={{ marginTop: 12 }}
          />
          
          <View style={styles.transferInfo}>
            <Text style={styles.transferTitle}>Transfer Pembayaran ke:</Text>
            <View style={styles.bankInfo}>
              <FontAwesome5 name="university" size={20} color={Colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.bankName}>BCA</Text>
                <Text style={styles.bankAccount}>6130301981</Text>
                <Text style={styles.bankOwner}>a/n DHIA MUTHI HAMIDAH</Text>
              </View>
            </View>
          </View>

          <Button 
            label="Konfirmasi via WhatsApp" 
            onPress={handleWhatsApp} 
            style={styles.waButton}
            icon={<FontAwesome5 name="whatsapp" size={20} color="#fff" style={{ marginRight: 8 }} />}
          />
          <Text style={styles.helperText}>
            *Anda akan diarahkan ke WhatsApp untuk mengirim bukti transfer.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  backButton: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textMuted, marginBottom: 24 },
  plansContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  planCard: {
    flex: 0.48,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center'
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF'
  },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  planName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  planPrice: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  planDuration: { fontSize: 12, color: Colors.textMuted, marginBottom: 16 },
  textSelected: { color: Colors.primary },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  radioSelected: { borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  formCard: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  transferInfo: { marginTop: 20, marginBottom: 20, backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12 },
  transferTitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 12 },
  bankInfo: { flexDirection: 'row', alignItems: 'center' },
  bankName: { fontWeight: '700', fontSize: 16, color: Colors.text },
  bankAccount: { fontSize: 18, fontWeight: '700', color: Colors.text, marginVertical: 2 },
  bankOwner: { fontSize: 14, color: Colors.textMuted },
  waButton: { backgroundColor: '#25D366' },
  helperText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 12 }
})

export default SubscriptionScreen