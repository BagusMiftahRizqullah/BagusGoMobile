import * as Location from 'expo-location'

export async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') throw new Error('Izin lokasi ditolak. Mohon izinkan akses lokasi.')

  const enabled = await Location.hasServicesEnabledAsync()
  if (!enabled) throw new Error('Layanan lokasi tidak aktif. Mohon aktifkan GPS.')

  try {
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    
    // DETEKSI EMULATOR: Jika lokasi di Mountain View (Googleplex), ganti ke Jakarta
    // Ini membantu testing tanpa perlu set lokasi manual di emulator
    if (Math.abs(pos.coords.latitude - 37.422) < 0.01 && Math.abs(pos.coords.longitude - (-122.084)) < 0.01) {
      console.warn('⚠️ Lokasi Emulator Terdeteksi (Mountain View). Menggunakan lokasi dummy Jakarta untuk testing.')
      return { lat: -6.2088, lng: 106.8456 } // Jakarta Pusat
    }

    return { lat: pos.coords.latitude, lng: pos.coords.longitude }
  } catch (error) {
    console.warn('Error getting current position, trying last known...', error)
    const lastKnown = await Location.getLastKnownPositionAsync()
    if (lastKnown) {
      return { lat: lastKnown.coords.latitude, lng: lastKnown.coords.longitude }
    }
    throw new Error('Gagal mendapatkan lokasi. Pastikan GPS aktif dan sinyal tersedia.')
  }
}
