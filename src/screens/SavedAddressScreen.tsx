import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Colors } from '@theme/colors'
import { RootStackParamList } from '../App'
import { useAuthStore } from '@store/auth'
import { Address, fetchAddresses, deleteAddress } from '@services/api'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'

type Props = NativeStackScreenProps<RootStackParamList, 'SavedAddresses'>

type SavedAddressItemProps = {
  item: Address
  onSelect: (address: Address) => void
  onEdit: (address: Address) => void
  onDelete: (address: Address) => void
}

const PAGE_SIZE = 10

const SavedAddressItem: React.FC<SavedAddressItemProps> = ({ item, onSelect, onEdit, onDelete }) => {
  return (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        <Text style={styles.itemAddress}>{item.address}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.selectButton} onPress={() => onSelect(item)}>
          <Text style={styles.selectText}>Pilih</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => onEdit(item)}>
          <MaterialIcons name="edit" size={20} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => onDelete(item)}>
          <MaterialIcons name="delete" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const SavedAddressScreen: React.FC<Props> = ({ navigation }) => {
  const token = useAuthStore((s) => s.token)
  const insets = useSafeAreaInsets()
  const [items, setItems] = useState<Address[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const isAuthorized = useMemo(() => typeof token === 'string' && token.length > 0, [token])

  const loadPage = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      if (!isAuthorized) {
        setError('Silakan login kembali')
        return
      }

      if (pageToLoad === 1) {
        setLoading(true)
        setError('')
      } else {
        setLoadingMore(true)
      }

      try {
        const data = await fetchAddresses(pageToLoad, PAGE_SIZE, token || '')
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]))
        setPage(data.page)
        setHasMore(data.hasMore)
      } catch (e) {
        setError('Gagal memuat alamat tersimpan')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [isAuthorized, token]
  )

  useEffect(() => {
    loadPage(1, true)
  }, [loadPage])

  const handleRefresh = useCallback(() => {
    loadPage(1, true)
  }, [loadPage])

  const handleEndReached = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      loadPage(page + 1, false)
    }
  }, [hasMore, loading, loadingMore, loadPage, page])

  const handleSelect = useCallback(
    (address: Address) => {
      navigation.navigate('AddAddress', { address: address.address })
    },
    [navigation]
  )

  const handleEdit = useCallback(
    (address: Address) => {
      navigation.navigate('MapSelection', {
        mode: 'saved-edit',
        addressId: address.id,
        initialAddress: address.address,
        initialLabel: address.label,
        initialLat: address.lat,
        initialLng: address.lng,
      })
    },
    [navigation]
  )

  const handleDelete = useCallback(
    (address: Address) => {
      Alert.alert('Hapus alamat', 'Yakin ingin menghapus alamat ini?', [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!isAuthorized) {
                setError('Silakan login kembali')
                return
              }
              await deleteAddress(address.id, token || '')
              setItems((prev) => prev.filter((item) => item.id !== address.id))
            } catch {
              Alert.alert('Error', 'Gagal menghapus alamat')
            }
          },
        },
      ])
    },
    [isAuthorized, token]
  )

  const renderItem = useCallback(
    ({ item }: { item: Address }) => (
      <SavedAddressItem item={item} onSelect={handleSelect} onEdit={handleEdit} onDelete={handleDelete} />
    ),
    [handleDelete, handleEdit, handleSelect]
  )

  const keyExtractor = useCallback((item: Address) => item.id, [])

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Saved Address</Text>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>Belum ada alamat tersimpan</Text> : null
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
        refreshing={loading}
        onRefresh={handleRefresh}
      />
      <TouchableOpacity
        style={[styles.fab, { bottom: 24 + insets.bottom }]}
        onPress={() =>
          navigation.navigate('MapSelection', {
            mode: 'saved-create',
          })
        }
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      {!items.length && loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text },
  errorText: {
    color: Colors.danger,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: Colors.textMuted,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemContent: {
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  itemAddress: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  selectText: {
    color: '#fff',
    fontWeight: '600',
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  footerLoading: {
    paddingVertical: 12,
  },
  centerLoading: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default SavedAddressScreen
