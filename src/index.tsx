import React, { useMemo, useRef, useState } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, Easing, withTiming, withSpring } from 'react-native-reanimated'
import { StyleSheet, Text, View, I18nManager } from 'react-native'
import { RotateAlphabets, getAlphabet } from './alphabets/alphabets';
import { TextStyle, TextProps  } from 'react-native'

type MeasureMap = { width: number, height: number }
interface OptionalTickerProps extends TextProps {
  duration?: number
  tickerType?: string
  rotateItems?: string[]
  textStyle?: TextStyle
}
interface TickProps extends OptionalTickerProps {
  children: string
  charSet?: string
  rotateItems?: string[]
  measureMap: MeasureMap
}
interface TickerProps extends OptionalTickerProps {
  charSet?: string
  value?: string
  children: Array<string>
}

const SpringOptions = { damping: 5, mass: 1, stiffness: 150 }

const styles = StyleSheet.create({
  row: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    overflow: 'hidden',
  },
  hide: { position: 'absolute', top: 0, left: 0, opacity: 0 },
})

const Tick = (props: TickProps) => {
  const {
    children, duration = 500, rotateItems = [], tickerType = 'spring',
  } = props

  const height = useSharedValue(props.measureMap.height)
  const width = useSharedValue(props.measureMap.width)

  const rotateItemsStyle = useAnimatedStyle(() => {
    'worklet'
    const toHeight = rotateItems.indexOf(children) * height.value * -1
    const TranslateY: { [tickerType: string]: Function } = {
      spring: (value: number) => withSpring(value, SpringOptions),
      linear: (value: number) =>  withTiming(value, {
        duration,
        easing: Easing.linear
      })
    }
    const translateY = TranslateY[tickerType](toHeight)
    return { transform: [{ translateY }] }
  })

  const viewPortStyle = useAnimatedStyle(() => {
    'worklet'
    return {
      width: withTiming(width.value, {
        duration: 25,
        easing: Easing.linear
      }),
      height: height.value,
      overflow: 'hidden'
    }
  })

  return (
    <Animated.View style={[viewPortStyle]} >
      <Animated.View style={[rotateItemsStyle]} >
        {rotateItems.map((text, i) => (
          <Animated.Text key={i} {...props} style={[props.textStyle, { height: height.value }]}>
            {text}
          </Animated.Text>
        ))}
      </Animated.View>
    </Animated.View>
  )
}

export const Ticker = (props: TickerProps) => {
  const [measured, setMeasured] = useState<boolean>(false)
  const measureMap = useRef<{ [key: string]: MeasureMap }>({}).current
  const textInput = `${props.value ?? props.children[0]}`.split('')

  const rotateItems: string[] = props.rotateItems != null
    ? [ ...new Set(props.rotateItems.join('').split('')) ]
    : getAlphabet(RotateAlphabets, props.charSet ?? 'Keypad.Numpad')

  const onLayout = (char: string) => (event: any) => {
    if (measureMap == null) return
    measureMap[char] = { ...event?.nativeEvent?.layout }
    if (Object.keys(measureMap).length === rotateItems.length) {
      setMeasured(true)
    }
  }

  const hiddenChildren = useMemo(() => rotateItems.map((char, i) =>
    <Text
      {...props}
      style={[props.textStyle, styles.hide]}
      key={i}
      onLayout={onLayout(char)}
    >{char}</Text>
  ), [ measureMap ])

  const childProps = { ...props, rotateItems }
  return (
    <View style={styles.row}>
      {hiddenChildren}
      {!measured
        ? null
        : textInput.map((char, i) =>
          <Tick {...childProps} measureMap={measureMap[char] ?? {}} key={i}>
            {char}
          </Tick>
        )}
    </View>
  )
}
