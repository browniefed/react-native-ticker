import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, Text, View, TextStyle } from "react-native";
import Animated, { Easing } from "react-native-reanimated";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    overflow: "hidden"
  },
  hide: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0
  }
});

const uniq = (values: string[]) => {
  return values.filter((value, index) => {
    return values.indexOf(value) === index;
  });
};

const range = length => Array.from({ length }, (x, i) => i);
const splitText = (text = "") => (text + "").split("");
const numberRange = range(10).map(p => p + "");
const numAdditional = [",", "."];

const getPosition = ({ text, items, height }) => {
  const index = items.findIndex(p => p === text);
  return index * height * -1;
};

interface Props {
  text: string;
  duration?: number;
  textStyle: TextStyle;
  additionalDisplayItems?: string[];
}

interface TickProps {
  text: string;
  duration: number;
  textStyle: TextStyle;
  rotateItems: string[];
  measureMap: MeasureMap;
}

type MeasureMap = { [key: string]: { width: number; height: number } };

const Tick: React.FC<TickProps> = ({
  text,
  duration,
  textStyle,
  measureMap,
  rotateItems
}) => {
  const measurement = measureMap[text];

  const position = getPosition({
    text: text,
    height: measurement.height,
    items: rotateItems
  });

  const widthAnim = useRef<any>(new Animated.Value(measurement.width));
  const stylePos = useRef<any>(new Animated.Value(position));

  useEffect(() => {
    if (stylePos.current) {
      Animated.timing(stylePos.current, {
        toValue: position,
        duration,
        easing: Easing.linear
      }).start();
      Animated.timing(widthAnim.current, {
        toValue: measurement.width,
        duration: 25,
        easing: Easing.linear
      }).start();
    }
  }, [position]);

  return (
    <Animated.View
      style={{
        height: measurement.height,
        width: widthAnim.current,
        overflow: "hidden"
      }}
    >
      <Animated.View
        style={{
          transform: [{ translateY: stylePos.current }]
        }}
      >
        {rotateItems.map(v => (
          <Text key={v} style={[textStyle, { height: measurement.height }]}>
            {v}
          </Text>
        ))}
      </Animated.View>
    </Animated.View>
  );
};

const Ticker: React.FC<Props> = ({
  text,
  duration,
  textStyle,
  additionalDisplayItems
}) => {
  const split = splitText(text);
  const [measured, setMeasured] = useState<boolean>(false);

  const measurableItems = uniq([
    ...numberRange,
    ...numAdditional,
    ...additionalDisplayItems
  ]);

  const measureMap = useRef<MeasureMap>({});

  const handleMeasure = (e, v: string) => {
    if (!measureMap.current) return;

    measureMap.current[v] = {
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height
    };

    if (Object.keys(measureMap.current).length === measurableItems.length) {
      setMeasured(true);
    }
  };

  return (
    <View style={styles.row}>
      {measured === true &&
        split.map((value, index) => {
          return (
            <Tick
              key={index}
              text={value}
              duration={duration}
              textStyle={textStyle}
              rotateItems={measurableItems}
              measureMap={measureMap.current}
            />
          );
        })}
      {measurableItems.map(v => {
        return (
          <Text
            key={v}
            style={[textStyle, styles.hide]}
            onLayout={e => handleMeasure(e, v)}
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
  additionalDisplayItems: []
};
export default Ticker;
