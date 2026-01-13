import React from 'react'
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@theme/colors'

type ButtonProps = {
  label: string
  onPress: () => void
  disabled?: boolean
  style?: ViewStyle
  loading?: boolean
  icon?: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ label, onPress, disabled, style, loading, icon }) => {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={[styles.container, style]}>
      <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.gradient}>
        {loading ? (
          <Text style={styles.label}>Loading…</Text>
        ) : (
          <React.Fragment>
            {icon}
            <Text style={styles.label}>{label}</Text>
          </React.Fragment>
        )}
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { borderRadius: 14, overflow: 'hidden' },
  gradient: { paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  label: { color: '#fff', fontSize: 16, fontWeight: '600' }
})

export default React.memo(Button)
