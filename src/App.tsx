import 'react-native-gesture-handler'
import React from 'react'
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
import { useAuthStore } from '@store/auth'

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

export default function App(): React.JSX.Element {
  const token = useAuthStore((s) => s.token)
  return (
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
  )
}
