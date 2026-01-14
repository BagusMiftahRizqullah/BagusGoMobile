import React, { useState, useRef } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Alert } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@theme/colors'
import Loading from '@components/Loading'
import { useTripStore } from '@store/trip'
import { useAuthStore } from '@store/auth'
import { getCurrentLocation } from '@services/location'
import { optimizeRoute, OptimizeItem } from '@services/api'
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler'
import { MaterialIcons } from '@expo/vector-icons'

const OptimizeItemRow = ({ 
  item, 
  index, 
  isDone, 
  markDone, 
  markUndone, 
  openMaps 
}: { 
  item: OptimizeItem, 
  index: number, 
  isDone: boolean, 
  markDone: (i: number) => void, 
  markUndone: (i: number) => void,
  openMaps: (addr: string) => void
}) => {
  const swipeableRef = useRef<Swipeable>(null)

  const renderLeftActions = () => (
    <View style={styles.leftAction}>
      <MaterialIcons name="check-circle" size={32} color="#fff" />
      <Text style={styles.actionText}>Selesai</Text>
    </View>
  )

  const renderRightActions = () => (
    <View style={styles.rightAction}>
      <MaterialIcons name="undo" size={32} color="#fff" />
      <Text style={styles.actionText}>Batal</Text>
    </View>
  )

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={!isDone ? renderLeftActions : undefined}
      renderRightActions={isDone ? renderRightActions : undefined}
      onSwipeableLeftOpen={() => {
        markDone(index)
        swipeableRef.current?.close()
      }}
      onSwipeableRightOpen={() => {
        markUndone(index)
        swipeableRef.current?.close()
      }}
    >
      <TouchableOpacity 
        style={[styles.item, isDone && styles.itemDone]} 
        onPress={() => openMaps(item.address)}
      >
        <View style={[styles.badge, isDone && styles.badgeDone]}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemTitle, isDone && styles.textDone]}>{item.address}</Text>
          <Text style={[styles.itemSub, isDone && styles.textDone]}>
            {(item.distance_km || 0).toFixed(2)} km • {item.duration || '-'}
          </Text>
        </View>
        {isDone && <MaterialIcons name="check" size={24} color={Colors.primaryAlt} />}
      </TouchableOpacity>
    </Swipeable>
  )
}

const OptimizeResultScreen: React.FC = () => {
  const addresses = useTripStore((s) => s.addresses)
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<OptimizeItem[]>([])
  const [error, setError] = useState('')
  const [doneItems, setDoneItems] = useState<Set<number>>(new Set())
  const insets = useSafeAreaInsets()

  React.useEffect(() => {
    const run = async (): Promise<void> => {
      setLoading(true)
      setError('')
      try {
        const origin = await getCurrentLocation()
        const res = await optimizeRoute({ origin, destinations: addresses.map((a) => a.text) }, token || '')
        setResults(res.data)
      } catch (e: any) {
        console.error('Optimize error:', e)

        if (e.response && e.response.status === 403) {
          Alert.alert(
            'Langganan Habis',
            'Maaf Trial/Subcribtion kamu sudah habis, harap lakukan Subcribtion kembali',
            [
              { text: 'OK', onPress: () => logout() }
            ]
          )
          return
        }

        const msg = e?.response?.data?.message || e?.message || 'Gagal optimasi'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [addresses, token])

  const openMaps = (address: string) => {
    // Membuka Google Maps dengan mode navigasi (driving)
    // origin default ke lokasi saat ini (Current Location)
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  }

  const markDone = (index: number) => {
    setDoneItems(prev => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }

  const markUndone = (index: number) => {
    setDoneItems(prev => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <FlatList
          data={results}
          keyExtractor={(item, idx) => `${idx}-${item.address}`}
          contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
          ListHeaderComponent={
            <>
              <Text style={styles.title}>Hasil Optimasi</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </>
          }
          renderItem={({ item, index }) => (
            <OptimizeItemRow 
              item={item} 
              index={index} 
              isDone={doneItems.has(index)} 
              markDone={markDone} 
              markUndone={markUndone} 
              openMaps={openMaps} 
            />
          )}
        />
        {loading ? <Loading /> : null}
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.background },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  error: { color: Colors.danger, marginTop: 8 },
  item: { 
    backgroundColor: '#fff', 
    borderRadius: 14, 
    padding: 14, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: Colors.border, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  itemDone: {
    backgroundColor: '#E8FDF5', // Light green bg
    borderColor: Colors.primaryAlt,
  },
  badge: { backgroundColor: Colors.primaryAlt, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  badgeDone: { backgroundColor: Colors.primaryAlt },
  badgeText: { color: '#fff', fontWeight: '700' },
  itemTitle: { color: Colors.text, fontWeight: '600' },
  itemSub: { color: Colors.textMuted, marginTop: 4 },
  textDone: {
    color: '#059669', // Darker green for text
  },
  leftAction: {
    backgroundColor: Colors.primaryAlt,
    justifyContent: 'center',
    alignItems: 'center', // Center content
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: -10, // Overlap effect
  },
  rightAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: -10,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  }
})

export default OptimizeResultScreen
