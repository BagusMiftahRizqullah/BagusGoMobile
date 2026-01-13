import React, { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'
import { Colors } from '@theme/colors'
import Button from '@components/Button'
import Card from '@components/Card'
import { useTripStore } from '@store/trip'
import * as ImagePicker from 'expo-image-picker'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { recognizeText } from '@services/ocr'
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons'
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete'
import Constants from 'expo-constants'

const extra = (Constants?.expoConfig?.extra || Constants?.manifest?.extra) as { GOOGLE_MAPS_API_KEY?: string }
const GOOGLE_MAPS_API_KEY = extra?.GOOGLE_MAPS_API_KEY || ''
const { width, height } = Dimensions.get('window')
const MASK_DIMENSION = width - 60

const AddAddressScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const addAddress = useTripStore((s) => s.addAddress)
  const addresses = useTripStore((s) => s.addresses)
  const [text, setText] = useState('')
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<CameraView>(null)
  const ref = useRef<GooglePlacesAutocompleteRef>(null)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (text) {
      ref.current?.setAddressText(text)
    }
  }, [text])

  const startCamera = async () => {
    if (!permission) {
      // Permission status is loading
      return
    }
    if (!permission.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        Alert.alert('Izin kamera diperlukan', 'Mohon izinkan akses kamera untuk memindai alamat.')
        return
      }
    }
    setShowCamera(true)
  }

  const captureImage = async () => {
    if (!cameraRef.current) return
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true })
      if (photo?.uri) {
        setShowCamera(false)
        processImage(photo.uri)
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal mengambil gambar')
    }
  }

  const processImage = async (uri: string): Promise<void> => {
    setImageUri(uri)
    setLoading(true)
    try {
      const ocr = await recognizeText(uri)
      const rawText = ocr.text
      
      if (!rawText.trim()) {
          Alert.alert('Gagal', 'Tidak ada teks yang terdeteksi')
          setLoading(false)
          return
      }

      // 1. Filter: Ambil baris yang mengandung kata kunci alamat (heuristic)
      const lines = rawText.split('\n')
      // Regex untuk menangkap pola alamat umum di Indonesia
      const addressKeywords = /(jalan|jl\.|jl\s|gg\.|gang|blok|no\.|kav|rt|rw|kelurahan|kecamatan|jakarta|bandung|surabaya|indonesia)/i
      const relevantLines = lines.filter(line => addressKeywords.test(line))
      
      // Gunakan baris relevan jika ada, atau fallback ke 3 baris pertama (biasanya alamat ada di atas/bawah header)
      // Atau fallback ke semua teks jika sangat sedikit
      let query = relevantLines.length > 0 
        ? relevantLines.join(', ') 
        : lines.slice(0, 5).join(', ') // Ambil 5 baris pertama sebagai fallback

      // 2. Search & Validate: Gunakan Google Geocoding API
      // Ini menggantikan fungsi "search" manual user
      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}&language=id`
        const resp = await fetch(geocodeUrl)
        const data = await resp.json()
        
        if (data.status === 'OK' && data.results.length > 0) {
          // Ambil alamat yang sudah diformat rapi oleh Google
          query = data.results[0].formatted_address
        }
      } catch (err) {
        console.warn('Geocoding failed, using raw OCR text', err)
      }

      // 3. Auto Input & Save
      setText(query)
      addAddress(query)
      setLoading(false)
      navigation.goBack()

    } catch (e) {
      Alert.alert('Error', 'Gagal memproses gambar')
      setLoading(false)
    }
  }

  const save = (): void => {
    if (!text.trim()) {
      Alert.alert('Alamat tidak boleh kosong')
      return
    }
    addAddress(text.trim())
    setText('')
    ref.current?.setAddressText('')
    setImageUri(null)
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Modal visible={showCamera} animationType="slide" onRequestClose={() => setShowCamera(false)}>
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing="back" ref={cameraRef}>
            <View style={styles.cameraOverlay}>
              {/* Top Mask */}
              <View style={[styles.mask, { height: (height - MASK_DIMENSION) / 2 }]} />
              
              <View style={styles.middleMaskContainer}>
                {/* Left Mask */}
                <View style={[styles.mask, { width: (width - MASK_DIMENSION) / 2 }]} />
                {/* Scanner Box (Transparent) */}
                <View style={styles.scannerBox}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
                {/* Right Mask */}
                <View style={[styles.mask, { width: (width - MASK_DIMENSION) / 2 }]} />
              </View>

              {/* Bottom Mask */}
              <View style={[styles.mask, { height: (height - MASK_DIMENSION) / 2 }]} />
              
              {/* Controls */}
              <View style={styles.cameraControls}>
                 <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.closeButton}>
                   <Ionicons name="close-circle" size={48} color="#fff" />
                 </TouchableOpacity>
                 <TouchableOpacity onPress={captureImage} style={styles.captureButton}>
                   <View style={styles.captureInner} />
                 </TouchableOpacity>
                 <View style={{ width: 48 }} /> 
              </View>

              <Text style={styles.cameraHint}>Posisikan alamat di dalam kotak</Text>
            </View>
          </CameraView>
        </View>
      </Modal>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 + insets.bottom }]} 
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Tambah Alamat</Text>
        
        <View style={styles.searchContainer}>
          <Text style={styles.label}>Cari Lokasi</Text>
          <GooglePlacesAutocomplete
            ref={ref}
            placeholder='Search geolocation...'
            onPress={(data: any, details: any = null) => {
              setText(data.description)
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: 'id',
              components: 'country:id',
            }}
            renderLeftButton={() => (
              <TouchableOpacity onPress={startCamera} style={styles.leftIcon}>
                <AntDesign name="scan" size={24} color={Colors.primary} />
              </TouchableOpacity>
            )}
            textInputProps={{
              onChangeText: (t: string) => setText(t),
              placeholderTextColor: Colors.textMuted,
            }}
            styles={{
              container: { flex: 0 },
              textInputContainer: {
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 12,
                backgroundColor: '#fff',
                alignItems: 'center',
                paddingLeft: 10,
              },
              textInput: {
                height: 48,
                color: Colors.text,
                backgroundColor: 'transparent',
                fontSize: 14,
              },
              predefinedPlacesDescription: {
                color: '#1faadb',
              },
              listView: {
                position: 'absolute',
                top: 60,
                zIndex: 10,
                backgroundColor: '#fff',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.border,
                elevation: 4,
              },
            }}
            enablePoweredByContainer={false}
            fetchDetails={false}
            nearbyPlacesAPI='GooglePlacesSearch'
            debounce={400}
          />
        </View>

        {text ? (
          <Card style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <MaterialIcons name="location-on" size={24} color={Colors.primary} />
              <Text style={styles.selectedTitle}>Alamat Terpilih</Text>
            </View>
            <Text style={styles.selectedText}>{text}</Text>
          </Card>
        ) : null}

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
        
        <Button label="Simpan" onPress={save} style={{ marginTop: 24, zIndex: 0 }} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  preview: { width: '100%', height: 240, borderRadius: 14, marginTop: 16, backgroundColor: '#fff' },
  searchContainer: {
    zIndex: 1,
  },
  label: { color: Colors.text, marginBottom: 8, fontWeight: '600' },
  leftIcon: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    zIndex: 0,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
  },
  selectedText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  // Camera UI Styles
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1 },
  mask: { backgroundColor: 'rgba(0,0,0,0.6)' },
  middleMaskContainer: { flexDirection: 'row', height: MASK_DIMENSION },
  scannerBox: { 
    width: MASK_DIMENSION, 
    height: MASK_DIMENSION, 
    borderColor: 'transparent', 
    borderWidth: 1,
    position: 'relative'
  },
  cameraHint: {
    position: 'absolute',
    top: '15%',
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff'
  },
  closeButton: {
    padding: 10
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
    borderWidth: 4
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 }
})

export default AddAddressScreen
