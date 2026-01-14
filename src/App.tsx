import 'react-native-gesture-handler'
import React, { useEffect, useState, useCallback } from 'react'
import { View } from 'react-native'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '@theme/colors'
import * as SplashScreen from 'expo-splash-screen'
import LoginScreen from '@screens/LoginScreen'
import RegisterScreen from '@screens/RegisterScreen'
import TripListScreen from '@screens/TripListScreen'
import HomeScreen from '@screens/HomeScreen'
import AddAddressScreen from '@screens/AddAddressScreen'
import OptimizeResultScreen from '@screens/OptimizeResultScreen'
import SubscriptionScreen from '@screens/SubscriptionScreen'
import { useAuthStore } from '@store/auth'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Home: undefined
  TripList: undefined
  AddAddress: undefined
  OptimizeResult: undefined
  Subscription: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: Colors.background }
}

export default function App(): React.JSX.Element | null {
  const token = useAuthStore((s) => s.token)
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // await Font.loadAsync(Entypo.font);
        
        // Delay for 2 seconds to ensure splash screen is visible
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
              <Stack.Screen name="OptimizeResult" component={OptimizeResultScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  )
}
