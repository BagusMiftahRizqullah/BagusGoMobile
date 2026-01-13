import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { Image } from 'expo-image'
import { Colors } from '@theme/colors'

const { width: screenWidth } = Dimensions.get('window')

interface BannerItem {
  id: string
  imageSource: any
}

interface Props {
  data: BannerItem[]
  autoSlideInterval?: number
  width?: number
}

const Banner: React.FC<Props> = ({ data, autoSlideInterval = 3000, width = screenWidth - 40 }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    if (data.length <= 1) return

    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1
      if (nextIndex >= data.length) {
        nextIndex = 0
      }
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      })
      setActiveIndex(nextIndex)
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [activeIndex, data.length, autoSlideInterval])

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width)
    setActiveIndex(index)
  }

  const renderItem = ({ item }: { item: BannerItem }) => (
    <View style={[styles.slide, { width }]}>
      <Image 
        source={item.imageSource} 
        style={styles.image} 
        contentFit="cover"
        transition={500}
      />
    </View>
  )

  const getItemLayout = (_: any, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  })

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
     // Optional: Update index while scrolling if needed, but onMomentumScrollEnd is usually enough for state sync
  }

  // Handle manual scroll to pause auto-slide? 
  // For simplicity, we keep it simple. If user interacts, the interval might jump, 
  // but usually we clear interval on touch. 
  // For this MVP, we'll leave as is.

  if (!data || data.length === 0) return null

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={getItemLayout}
        scrollEventThrottle={16}
      />
      
      <View style={styles.pagination}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden', // Ensures border radius clips the content
    backgroundColor: '#f0f0f0',
  },
  slide: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 20, // Elongated active dot
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  }
})

export default Banner
