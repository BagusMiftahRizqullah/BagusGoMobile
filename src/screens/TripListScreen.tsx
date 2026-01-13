import React, { useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@theme/colors'
import { useTripStore } from '@store/trip'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'
import Button from '@components/Button'

type Props = NativeStackScreenProps<RootStackParamList, 'TripList'>

const TripListScreen: React.FC<Props> = ({ navigation }) => {
  const addresses = useTripStore((s) => s.addresses)
  const deleteAddress = useTripStore((s) => s.deleteAddress)
  const editEnabled = useMemo(() => addresses.length > 0, [addresses.length])
  const canOptimize = useMemo(() => addresses.length >= 2, [addresses.length])
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Daftar Alamat</Text>
          </>
        }
        data={addresses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <View style={styles.badge}><Text style={styles.badgeText}>{index + 1}</Text></View>
            <Text style={styles.itemText}>{item.text}</Text>
            <Pressable onPress={() => deleteAddress(item.id)} style={styles.delete}><Text style={styles.deleteText}>Hapus</Text></Pressable>
          </View>
        )}
      />
      {canOptimize ? (
        <Button label="Optimasi Rute" onPress={() => navigation.navigate('OptimizeResult')} style={{ position: 'absolute', bottom: 20 + insets.bottom, left: 20, right: 20 }} />
      ) : null}
      <Button label="Tambah Alamat" onPress={() => navigation.navigate('AddAddress')} style={{ position: 'absolute', bottom: (canOptimize ? 80 : 20) + insets.bottom, left: 20, right: 20 }} />
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {  padding: 20, backgroundColor: Colors.background },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  item: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center' },
  badge: { backgroundColor: Colors.primary, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  badgeText: { color: '#fff', fontWeight: '700' },
  itemText: { flex: 1, color: Colors.text },
  delete: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#FFF5F5' },
  deleteText: { color: Colors.danger, fontWeight: '600' }
})

export default TripListScreen
