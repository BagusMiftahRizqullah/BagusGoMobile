import 'react-native-gesture-handler'
import React, { useEffect, useState } from 'react'
import { View, ImageBackground } from 'react-native'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '@theme/colors'
import LoginScreen from '@screens/LoginScreen'
import RegisterScreen from '@screens/RegisterScreen'
import TripListScreen from '@screens/TripListScreen'
import HomeScreen from '@screens/HomeScreen'
import AddAddressScreen from '@screens/AddAddressScreen'
import OptimizeResultScreen from '@screens/OptimizeResultScreen'
import SubscriptionScreen from '@screens/SubscriptionScreen'
import MapSelectionScreen from '@screens/MapSelectionScreen'
import { useAuthStore } from '@store/auth'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Home: undefined
  TripList: undefined
  AddAddress: { address?: string; lat?: number; lng?: number } | undefined
  OptimizeResult: undefined
  Subscription: undefined
  MapSelection: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: Colors.background }
}

export default function App(): React.JSX.Element | null {
  const token = useAuthStore((s) => s.token)
  const [appIsReady, setAppIsReady] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const prepare = async () => {
      try {
      } finally {
        setAppIsReady(true)
        setTimeout(() => {
          setShowSplash(false)
        }, 2000)
      }
    }

    prepare()
  }, [])

  if (!appIsReady) {
    return null
  }

  if (showSplash) {
    return (
      <ImageBackground
        source={require('./images/SplashScreen.png')}
        style={{ flex: 1}}
        resizeMode="cover"
      />
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!token ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="TripList" component={TripListScreen} />
              <Stack.Screen name="AddAddress" component={AddAddressScreen} />
              <Stack.Screen name="MapSelection" component={MapSelectionScreen} />
              <Stack.Screen name="OptimizeResult" component={OptimizeResultScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  )
}
