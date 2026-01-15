import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native'
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'
import { Colors } from '@theme/colors'
import Button from '@components/Button'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { getCurrentLocation } from '@services/location'

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

const MapSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const mapRef = React.useRef<MapView | null>(null)
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

  useEffect(() => {
    const init = async () => {
      try {
        const loc = await getCurrentLocation()
        const initialRegion: Region = {
          latitude: loc.lat,
          longitude: loc.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
        setRegion(initialRegion)
      } catch (e) {
        Alert.alert('Lokasi tidak tersedia', 'Menggunakan lokasi Jakarta sebagai titik awal.')
      }
    }

    init()
  }, [])

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

  const handleConfirm = () => {
    if (!selectedCoord || !address) {
      Alert.alert('Pilih lokasi terlebih dahulu')
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
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation
        followsUserLocation
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

      <TouchableOpacity style={styles.myLocationButton} onPress={centerOnUserLocation}>
        <Ionicons name="locate" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.bottomPanel}>
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

        <Button
          label="Konfirmasi Lokasi"
          onPress={handleConfirm}
          style={styles.confirmButton}
          disabled={!selectedCoord || !address || loadingAddress}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  map: { flex: 1 },
  myLocationButton: {
    position: 'absolute',
    right: 16,
    bottom: 190,
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
  confirmButton: {
    marginTop: 8,
  },
})

export default MapSelectionScreen
