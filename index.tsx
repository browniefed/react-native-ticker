import React, { useRef, useEffect, useState, Children } from "react";
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

const range = (length: number) => Array.from({ length }, (x, i) => i);
const splitText = (text = "") => (text + "").split("");
const numberRange = range(10).map(p => p + "");
const numAdditional = [",", "."];
const numberItems = [...numberRange, ...numAdditional];
const isNumber = (v: string) => !isNaN(parseInt(v));

const getPosition = ({
  text,
  items,
  height
}: {
  text: string;
  items: string[];
  height: number;
}) => {
  const index = items.findIndex(p => p === text);
  return index * height * -1;
};

interface Props {
  duration?: number;
  textStyle: TextStyle;
  additionalDisplayItems?: string[];
  children: React.ReactNode;
}

interface TickProps {
  children: string;
  duration: number;
  textStyle: TextStyle;
  rotateItems: string[];
  measureMap: MeasureMap;
}

type MeasureMap = { [key: string]: { width: number; height: number } };

export const Tick: React.FC<{ children: string; rotateItems: string[] }> = ({
  ...props
}) => {
  //@ts-ignore
  return <TickItem {...props} />;
};

const useInitRef = (cb: () => Animated.Value<number>) => {
  const ref = useRef<Animated.Value<number>>();
  if (!ref.current) {
    ref.current = cb();
  }

  return ref.current;
};

const TickItem: React.FC<TickProps> = ({
  children,
  duration,
  textStyle,
  measureMap,
  rotateItems
}) => {
  const measurement = measureMap[children];

  const position = getPosition({
    text: children,
    height: measurement.height,
    items: rotateItems
  });

  const widthAnim = useInitRef(() => new Animated.Value(measurement.width));
  const stylePos = useInitRef(() => new Animated.Value(position));

  useEffect(() => {
    if (stylePos) {
      Animated.timing(stylePos, {
        toValue: position,
        duration,
        easing: Easing.linear
      }).start();
      Animated.timing(widthAnim, {
        toValue: measurement.width,
        duration: 25,
        easing: Easing.linear
      }).start();
    }
  }, [position, measurement]);

  return (
    <Animated.View
      style={{
        height: measurement.height,
        width: widthAnim,
        overflow: "hidden"
      }}
    >
      <Animated.View
        style={{
          transform: [{ translateY: stylePos }]
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

const Ticker: React.FC<Props> = ({ duration = 250, textStyle, children }) => {
  const [measured, setMeasured] = useState<boolean>(false);

  const measureMap = useRef<MeasureMap>({});
  const measureStrings: string[] = Children.map(children, child => {
    if (typeof child === "string" || typeof child === "number") {
      return splitText(`${child}`);
    } else {
      //@ts-ignore
      return child.props && child.props.rotateItems;
    }
  }).flat();

  const hasNumbers = measureStrings.find(v => isNumber(v)) !== undefined;
  const rotateItems = uniq([
    ...(hasNumbers ? numberItems : []),
    ...measureStrings
  ]);

  const handleMeasure = (e: any, v: string) => {
    if (!measureMap.current) return;

    measureMap.current[v] = {
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height
    };

    if (Object.keys(measureMap.current).length === rotateItems.length) {
      setMeasured(true);
    }
  };

  return (
    <View style={styles.row}>
      {measured === true &&
        Children.map(children, child => {
          if (typeof child === "string" || typeof child === "number") {
            return splitText(`${child}`).map((text, index) => {
              let items = isNumber(text) ? numberItems : [text];
              return (
                <TickItem
                  key={index}
                  duration={duration}
                  textStyle={textStyle}
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
              measureMap: measureMap.current
            });
          }
        })}
      {rotateItems.map(v => {
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
  duration: 250
};
export default Ticker;
