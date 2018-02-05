import React, { Component } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import PropTypes from "prop-types";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    overflow: "hidden",
  },
  hide: {
    position: "absolute",
    left: 0,
    right: 0,
    opacity: 0,
  },
});

const range = length => Array.from({ length }, (x, i) => i);
const getPosition = ({ text, items, height }) => {
  const index = items.findIndex(p => p === text);
  return index * height * -1;
};
const splitText = (text = "") => (text + "").split("");
const isNumber = (text = "") => !isNaN(parseInt(text, 10));
const isString = (text = "") => typeof text === "string";
const numberRange = range(10).map(p => p + "");

const getAnimationStyle = animation => {
  return {
    transform: [
      {
        translateY: animation,
      },
    ],
  };
};

const Piece = ({ children, style, textStyle }) => {
  return (
    <View style={style}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
};

class Ticker extends Component {
  static propTypes = {
    text: PropTypes.string,
    textStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
  };
  static defaultProps = {
    rotateTime: 250,
  };
  state = {
    measured: false,
    height: 0,
    fontSize: StyleSheet.flatten(this.props.textStyle).fontSize,
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      fontSize: StyleSheet.flatten(nextProps.textStyle).fontSize,
    });
  }
  handleMeasure = e => {
    this.setState({
      measured: true,
      height: e.nativeEvent.layout.height,
    });
  };

  render() {
    const { text, children, textStyle, style, rotateTime } = this.props;
    const { height, measured } = this.state;

    const childs = text || children;

    const rendererProps = {
      children: childs,
      textStyle,
      height,
      rotateTime,
      rotateItems: numberRange,
    };

    // For a simple string child we can display the text immediately, measure it, and replace it with the ticks
    if (isString(childs)) {
      const content = measured ? stringNumberRenderer(rendererProps) : (
        <Text style={textStyle} onLayout={this.handleMeasure}>
          {childs}
        </Text>
      );
      const dynamicStyles = measured ? ({height}) : undefined;
      return (
        <View style={[styles.row,dynamicStyles,style]}>
          {content}
        </View>
      );
    }
    // For more complex childs we need to measure the text height before being able to render
    else {
      const dynamicStyles = measured ? ({height}) : {opacity: 0};
      const measureElement = (
        <Text style={[textStyle, styles.hide]} onLayout={this.handleMeasure} pointerEvents="none">
          0
        </Text>
      );
      return (
        <View style={[styles.row, dynamicStyles, style]}>
          {generalChildRenderer(rendererProps)}
          {measureElement}
        </View>
      );
    }
  }
}

const generalChildRenderer = ({ children, textStyle, height, rotateTime, rotateItems = [] }) => {
  return React.Children.map(children, (child, i) => {
    if (isString(child)) {
      return (
        <Piece style={{ height }} textStyle={textStyle}>
          {child}
        </Piece>
      );
    }

    const items = child.props.rotateItems || rotateItems;
    const key = items.join(",") + i;

    return React.cloneElement(child, {
      key,
      text: child.props.text || child.props.children,
      height,
      duration: child.props.rotateTime || rotateTime,
      textStyle,
      rotateItems: child.props.rotateItems || rotateItems,
    });
  });
};

const stringNumberRenderer = ({ children, textStyle, height, rotateTime, rotateItems }) => {
  return splitText(children).map((piece, i) => {
    if (!isNumber(piece))
      return (
        <Piece key={i} style={{ height }} textStyle={textStyle}>
          {piece}
        </Piece>
      );
    return (
      <Tick
        duration={rotateTime}
        key={i}
        text={piece}
        textStyle={textStyle}
        height={height}
        rotateItems={rotateItems}
      />
    );
  });
};

class Tick extends Component {
  state = {
    animation: new Animated.Value(
      getPosition({
        text: this.props.text,
        items: this.props.rotateItems,
        height: this.props.height,
      }),
    ),
  };
  componentDidMount() {
    // If we first render then don't do a mounting animation
    if (this.props.height !== 0) {
      this.setState({
        animation: new Animated.Value(
          getPosition({
            text: this.props.text,
            items: this.props.rotateItems,
            height: this.props.height,
          }),
        ),
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.height !== this.props.height) {
      this.setState({
        animation: new Animated.Value(
          getPosition({
            text: nextProps.text,
            items: nextProps.rotateItems,
            height: nextProps.height,
          }),
        ),
      });
    }
  }
  componentDidUpdate(prevProps) {
    const { height, duration, rotateItems, text } = this.props;

    if (prevProps.text !== text) {
      Animated.timing(this.state.animation, {
        toValue: getPosition({
          text: text,
          items: rotateItems,
          height,
        }),
        duration,
        useNativeDriver: true,
      }).start();
    }
  }

  render() {
    const { animation } = this.state;
    const { textStyle, height, rotateItems } = this.props;

    return (
      <View style={{ height }}>
        <Animated.View style={getAnimationStyle(animation)}>
          {rotateItems.map(v => (
            <Text key={v} style={textStyle}>
              {v}
            </Text>
          ))}
        </Animated.View>
      </View>
    );
  }
}

export { Tick, numberRange };
export default Ticker;
