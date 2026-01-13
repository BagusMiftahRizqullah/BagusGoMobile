import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'
import { Colors } from '@theme/colors'
import Banner from '@components/Banner'
import { useAuthStore } from '@store/auth'
import { MaterialIcons } from '@expo/vector-icons'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

const BANNER_DATA = [
  { id: '1', imageSource: require('../images/Banner1.png') },
  { id: '2', imageSource: require('../images/Banner2.png') },
]

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {user?.phone_number || 'Pengguna'}</Text>
          <Text style={styles.subtitle}>Selamat datang di BagusGo</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.bannerContainer}>
        <Banner data={BANNER_DATA} />
      </View>

      <Text style={styles.sectionTitle}>Layanan Kami</Text>
      
      <View style={styles.menuGrid}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('TripList')}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="alt-route" size={32} color="#fff" />
          </View>
          <Text style={styles.menuText}>Optimisasi Rute</Text>
        </TouchableOpacity>

        {/* Placeholder untuk menu lain */}
        <View style={[styles.menuItem, styles.disabledMenu]}>
          <View style={[styles.iconContainer, styles.disabledIcon]}>
            <MaterialIcons name="more-horiz" size={32} color="#fff" />
          </View>
          <Text style={[styles.menuText, styles.disabledText]}>Coming Soon</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  menuItem: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  disabledMenu: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
    borderColor: 'transparent',
    elevation: 0,
  },
  disabledIcon: {
    backgroundColor: '#ccc',
  },
  disabledText: {
    color: '#999',
  }
})

export default HomeScreen
