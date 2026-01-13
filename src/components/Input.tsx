import React from 'react'
import { TextInput, StyleSheet, View, Text, ViewStyle, TouchableOpacity } from 'react-native'
import { Colors } from '@theme/colors'

type InputProps = {
  label?: string
  value: string
  onChangeText: (t: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  style?: ViewStyle
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad'
  leftIcon?: React.ReactNode
  onLeftIconPress?: () => void
  rightIcon?: React.ReactNode
  onRightIconPress?: () => void
}

const Input: React.FC<InputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  style, 
  keyboardType,
  leftIcon,
  onLeftIconPress,
  rightIcon,
  onRightIconPress
}) => {
  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {leftIcon && (
          <TouchableOpacity onPress={onLeftIconPress} style={styles.iconContainer} disabled={!onLeftIconPress}>
            {leftIcon}
          </TouchableOpacity>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          style={styles.input}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconContainer} disabled={!onRightIconPress}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  label: { color: Colors.text, marginBottom: 8, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  iconContainer: {
    paddingLeft: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightIconContainer: {
    paddingRight: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    height: '100%'
  }
})

export default React.memo(Input)
