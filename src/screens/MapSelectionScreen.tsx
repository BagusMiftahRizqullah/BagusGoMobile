import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native'
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'
import { Colors } from '@theme/colors'
import Button from '@components/Button'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { getCurrentLocation } from '@services/location'
import { useAuthStore } from '@store/auth'
import { createAddress, updateAddress } from '@services/api'

type Props = NativeStackScreenProps<RootStackParamList, 'MapSelection'>

type Coordinate = {
  lat: number
  lng: number
}

type ExtraConfig = {
  GOOGLE_MAPS_API_KEY?: string
}

const extra = (Constants?.expoConfig?.extra || Constants?.manifest?.extra) as ExtraConfig
const GOOGLE_MAPS_API_KEY = extra?.GOOGLE_MAPS_API_KEY || ''

const MapSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const mapRef = React.useRef<MapView | null>(null)
  const token = useAuthStore((s) => s.token)
  const [region, setRegion] = useState<Region>({
    latitude: -6.2088,
    longitude: 106.8456,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  })
  const [selectedCoord, setSelectedCoord] = useState<Coordinate | null>(null)
  const [address, setAddress] = useState('')
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [error, setError] = useState('')
  const [label, setLabel] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const mode = route.params?.mode ?? 'trip'
  const isSavedMode = mode === 'saved-create' || mode === 'saved-edit'
  const initialLat = route.params?.initialLat
  const initialLng = route.params?.initialLng
  const initialAddress = route.params?.initialAddress
  const initialLabel = route.params?.initialLabel
  const addressId = route.params?.addressId

  const [bottomPanelHeight, setBottomPanelHeight] = useState(0)

  const myLocationBottom = useMemo(
    () => (bottomPanelHeight > 0 ? bottomPanelHeight + 16 : 180),
    [bottomPanelHeight]
  )

  useEffect(() => {
    const init = async () => {
      if (typeof initialLat === 'number' && typeof initialLng === 'number') {
        const coord: Coordinate = { lat: initialLat, lng: initialLng }
        const initialRegion: Region = {
          latitude: coord.lat,
          longitude: coord.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
        setRegion(initialRegion)
        setSelectedCoord(coord)
        if (initialAddress) {
          setAddress(initialAddress)
        }
        if (initialLabel) {
          setLabel(initialLabel)
        }
        return
      }

      try {
        const loc = await getCurrentLocation()
        const initialRegion: Region = {
          latitude: loc.lat,
          longitude: loc.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
        setRegion(initialRegion)
      } catch {
        Alert.alert('Lokasi tidak tersedia', 'Menggunakan lokasi Jakarta sebagai titik awal.')
      }
    }

    init()
  }, [initialAddress, initialLabel, initialLat, initialLng])

  const reverseGeocode = useCallback(async (coord: Coordinate) => {
    if (!GOOGLE_MAPS_API_KEY) {
      setAddress('')
      setError('API Maps belum dikonfigurasi')
      return
    }

    setLoadingAddress(true)
    setError('')
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coord.lat},${coord.lng}&key=${GOOGLE_MAPS_API_KEY}&language=id`
      const resp = await fetch(url)
      const data = await resp.json()

      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        setAddress(data.results[0].formatted_address || '')
      } else {
        setAddress('')
        setError('Gagal mendapatkan alamat dari lokasi ini')
      }
    } catch {
      setAddress('')
      setError('Gagal melakukan reverse geocoding')
    } finally {
      setLoadingAddress(false)
    }
  }, [])

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate
    const coord = { lat: latitude, lng: longitude }
    setSelectedCoord(coord)
    reverseGeocode(coord)
  }

  const centerOnUserLocation = async (): Promise<void> => {
    try {
      // console.log('centerOnUserLocation')
      const loc = await getCurrentLocation()
      // console.log('loc123', loc)
      const coord: Coordinate = { lat: loc.lat, lng: loc.lng }
      const nextRegion: Region = {
        latitude: coord.lat,
        longitude: coord.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
      setRegion(nextRegion)
      setSelectedCoord(coord)
      reverseGeocode(coord)
      if (mapRef.current) {
        mapRef.current.animateToRegion(nextRegion, 500)
      }
    } catch (err: any) {
      const fallbackRegion: Region = {
        latitude: -6.2088,
        longitude: 106.8456,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
      setRegion(fallbackRegion)
      const coord = { lat: fallbackRegion.latitude, lng: fallbackRegion.longitude }
      setSelectedCoord(coord)
      reverseGeocode(coord)
      if (mapRef.current) {
        mapRef.current.animateToRegion(fallbackRegion, 500)
      }
      const message = typeof err?.message === 'string' && err.message
        ? `${err.message}\n\nMenggunakan Jakarta sebagai lokasi sementara. Pastikan izin lokasi aktif jika ingin posisi realtime.`
        : 'Menggunakan Jakarta sebagai lokasi sementara. Pastikan izin lokasi aktif jika ingin posisi realtime.'
      Alert.alert('Lokasi tidak tersedia', message)
    }
  }

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim()
    if (!query) {
      return
    }

    if (!GOOGLE_MAPS_API_KEY) {
      setError('API Maps belum dikonfigurasi')
      return
    }

    setLoadingAddress(true)
    setError('')
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        query
      )}&key=${GOOGLE_MAPS_API_KEY}&language=id`
      const resp = await fetch(url)
      const data = await resp.json()

      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        const result = data.results[0]
        const loc = result.geometry.location
        const coord: Coordinate = { lat: loc.lat, lng: loc.lng }
        const nextRegion: Region = {
          latitude: coord.lat,
          longitude: coord.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
        setSelectedCoord(coord)
        setRegion(nextRegion)
        setAddress(result.formatted_address || '')
        if (mapRef.current) {
          mapRef.current.animateToRegion(nextRegion, 600)
        }
      } else {
        setSelectedCoord(null)
        setAddress('')
        setError('Lokasi tidak ditemukan')
      }
    } catch {
      setSelectedCoord(null)
      setAddress('')
      setError('Gagal mencari lokasi')
    } finally {
      setLoadingAddress(false)
    }
  }, [searchQuery])

  const handleConfirm = async () => {
    if (!selectedCoord || !address) {
      Alert.alert('Pilih lokasi terlebih dahulu')
      return
    }

    if (isSavedMode) {
      if (!label.trim()) {
        Alert.alert('Nama alamat wajib diisi')
        return
      }

      if (!token) {
        Alert.alert('Sesi berakhir', 'Silakan login kembali')
        return
      }

      try {
        setSubmitting(true)
        if (mode === 'saved-create') {
          await createAddress(
            {
              label: label.trim(),
              address,
              lat: selectedCoord.lat,
              lng: selectedCoord.lng,
            },
            token
          )
        } else if (mode === 'saved-edit' && addressId) {
          await updateAddress(
            addressId,
            {
              label: label.trim(),
              address,
              lat: selectedCoord.lat,
              lng: selectedCoord.lng,
            },
            token
          )
        }
        navigation.goBack()
      } catch {
        Alert.alert('Error', 'Gagal menyimpan alamat')
      } finally {
        setSubmitting(false)
      }
      return
    }

    navigation.navigate('AddAddress', {
      address,
      lat: selectedCoord.lat,
      lng: selectedCoord.lng,
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari lokasi"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Cari</Text>
          </TouchableOpacity>
        </View>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation
        followsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
      >
        {selectedCoord ? (
          <Marker
            coordinate={{
              latitude: selectedCoord.lat,
              longitude: selectedCoord.lng,
            }}
          />
        ) : null}
      </MapView>

      <TouchableOpacity
        style={[styles.myLocationButton, { bottom: myLocationBottom }]}
        onPress={centerOnUserLocation}
      >
        <Ionicons name="locate" size={24} color="#fff" />
      </TouchableOpacity>

      <View
        style={styles.bottomPanel}
        onLayout={(e) => {
          setBottomPanelHeight(e.nativeEvent.layout.height)
        }}
      >
        <Text style={styles.panelTitle}>Lokasi Dipilih</Text>
        {loadingAddress ? (
          <View style={styles.addressLoadingRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.addressLoadingText}>Mengambil alamat...</Text>
          </View>
        ) : (
          <Text style={styles.addressText}>
            {address || (selectedCoord ? 'Alamat belum tersedia untuk titik ini' : 'Sentuh peta untuk memilih lokasi')}
          </Text>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {isSavedMode ? (
          <View style={styles.labelInputWrapper}>
            <Text style={styles.labelTitle}>Nama Alamat</Text>
            <TextInput
              style={styles.labelInput}
              value={label}
              onChangeText={setLabel}
              placeholder="Contoh: Rumah, Kantor"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        ) : null}

        <Button
          label={isSavedMode ? 'Simpan Alamat' : 'Konfirmasi Lokasi'}
          onPress={handleConfirm}
          style={styles.confirmButton}
          disabled={!selectedCoord || !address || loadingAddress || submitting}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    paddingVertical: 4,
  },
  searchButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  map: { flex: 1 },
  myLocationButton: {
    position: 'absolute',
    bottom: 260,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  bottomPanel: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginBottom: 8,
  },
  addressLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLoadingText: {
    marginLeft: 8,
    color: Colors.text,
  },
  labelInputWrapper: {
    marginTop: 8,
    marginBottom: 4,
  },
  labelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  labelInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colors.text,
  },
  confirmButton: {
    marginTop: 8,
  },
})

export default MapSelectionScreen
