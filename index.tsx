import React, { useRef, useEffect, useState, Children } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  TextProps,
  I18nManager,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const styles = StyleSheet.create({
  row: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    overflow: 'hidden',
  },
  hide: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
  },
});

const uniq = (values: string[]) => {
  return values.filter((value, index) => {
    return values.indexOf(value) === index;
  });
};

const range = (length: number) => Array.from({ length }, (x, i) => i);
const splitText = (text = '') => (text + '').split('');
const numberRange = range(10).map((p) => p + '');
const numAdditional = [',', '.'];
const numberItems = [...numberRange, ...numAdditional];
const isNumber = (v: string) => !isNaN(parseInt(v));

const getPosition = ({
  text,
  items,
  height,
}: {
  text: string;
  items: string[];
  height: number;
}) => {
  const index = items.findIndex((p) => p === text);
  return index * height * -1;
};

interface Props {
  duration?: number;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  textProps?: TextProps;
  additionalDisplayItems?: string[];
  children: React.ReactNode;
}

interface TickProps {
  children: string;
  duration: number;
  textStyle?: TextStyle;
  textProps?: TextProps;
  rotateItems: string[];
  measureMap: MeasureMap;
}

type MeasureMap = Record<string, { width: number; height: number }>;

export const Tick = ({ ...props }: Partial<TickProps>) => {
  //@ts-ignore
  return <TickItem {...props} />;
};

const TickItem = ({
  children,
  duration,
  textStyle,
  textProps,
  measureMap,
  rotateItems,
}: TickProps) => {
  const measurement = measureMap[children];
  const position = getPosition({
    text: children,
    height: measurement.height,
    items: rotateItems,
  });

  const widthAnim = useSharedValue(measurement.width);
  const stylePos = useSharedValue(position);

  const animatedStyles = useAnimatedStyle(() => ({
    height: measurement.height,
    width: widthAnim.value,
    overflow: 'hidden',
    transform: [{ translateY: stylePos.value }],
  }));

  useEffect(() => {
    stylePos.value = withTiming(position, {
      duration: duration,
      easing: Easing.linear,
    });
    widthAnim.value = withTiming(measurement.width, {
      duration: 25,
      easing: Easing.linear,
    });
  }, [position, measurement, duration]);

  return (
    <Animated.View style={animatedStyles}>
      {rotateItems.map((v) => (
        <Text
          key={v}
          {...textProps}
          style={[textStyle, { height: measurement.height }]}
        >
          {v}
        </Text>
      ))}
    </Animated.View>
  );
};

const Ticker = ({
  duration = 250,
  containerStyle,
  textStyle,
  textProps,
  children,
}: Props) => {
  const [measured, setMeasured] = useState<boolean>(false);

  const measureMap = useRef<MeasureMap>({});
  const measureStrings: string[] = Children.map(children as any, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return splitText(`${child}`);
    } else if (child) {
      return child?.props && child?.props?.rotateItems;
    }
  }).reduce((acc, val) => acc.concat(val), []);

  const hasNumbers = measureStrings.find((v) => isNumber(v)) !== undefined;
  const rotateItems = uniq([
    ...(hasNumbers ? numberItems : []),
    ...measureStrings,
  ]);

  const handleMeasure = (e: any, v: string) => {
    if (!measureMap.current) return;

    measureMap.current[v] = {
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    };

    if (Object.keys(measureMap.current).length === rotateItems.length) {
      setMeasured(true);
    }
  };

  return (
    <View style={[styles.row, containerStyle]}>
      {measured === true &&
        Children.map(children, (child) => {
          if (typeof child === 'string' || typeof child === 'number') {
            return splitText(`${child}`).map((text, index) => {
              let items = isNumber(text) ? numberItems : [text];
              return (
                <TickItem
                  key={index}
                  duration={duration}
                  textStyle={textStyle}
                  textProps={textProps}
                  rotateItems={items}
                  measureMap={measureMap.current}
                >
                  {text}
                </TickItem>
              );
            });
          } else {
            //@ts-ignore
            return React.cloneElement(child, {
              duration,
              textStyle,
              textProps,
              measureMap: measureMap.current,
            });
          }
        })}
      {rotateItems.map((v) => {
        return (
          <Text
            key={v}
            {...textProps}
            style={[textStyle, styles.hide]}
            onLayout={(e) => handleMeasure(e, v)}
          >
            {v}
          </Text>
        );
      })}
    </View>
  );
};

Ticker.defaultProps = {
  duration: 250,
};

export default Ticker;
