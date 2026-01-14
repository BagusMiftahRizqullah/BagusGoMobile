import React from 'react'
import { View, StyleSheet, ViewStyle, Animated, Easing } from 'react-native'
import { Colors } from '@theme/colors'

interface LoadingProps {
  fullscreen?: boolean
  size?: number
  style?: ViewStyle
}

const Loading: React.FC<LoadingProps> = ({ fullscreen = true, size = 120, style }) => {
  const progress = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [progress])

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  })

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  })

  if (fullscreen) {
    return (
      <View style={[styles.overlay, style]}>
        <Animated.Image
          source={require('../images/Logo.png')}
          style={[
            styles.logo,
            {
              width: size,
              height: size * 0.4,
              opacity,
              transform: [{ scale }],
            },
          ]}
          resizeMode="contain"
        />
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <Animated.Image
        source={require('../images/Logo.png')}
        style={[
          styles.logo,
          {
            width: size,
            height: size * 0.4,
            opacity,
            transform: [{ scale }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 999,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    borderRadius: 12,
  },
})

export default React.memo(Loading)
