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
const getPosition = (number, height) => parseFloat(number, 10) * -1 * height;
const splitText = (text = "") => (text + "").split("");
const isNumber = (text = "") => !isNaN(parseInt(text, 10));
const measureText = range(10);

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
      <Text style={textStyle} includeFontPadding={false}>
        {children}
      </Text>
    </View>
  );
};

class RotateText extends Component {
  static propTypes = {
    text: PropTypes.string,
    textStyle: PropTypes.number,
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
    const { text, textStyle, style } = this.props;
    const { height, measured } = this.state;
    const opacity = measured ? 1 : 0;

    return (
      <View style={[styles.row, { height, opacity }, style]}>
        {splitText(text).map((piece, i) => {
          if (!isNumber(piece))
            return (
              <Piece key={i} style={{ height }} textStyle={textStyle}>
                {piece}
              </Piece>
            );
          return <TextRotator key={i} text={piece} textStyle={textStyle} height={height} />;
        })}
        <Text
          style={[textStyle, styles.hide]}
          onLayout={this.handleMeasure}
          pointerEvents="none"
          includeFontPadding={false}
        >
          0
        </Text>
      </View>
    );
  }
}

class TextRotator extends Component {
  state = {
    animation: new Animated.Value(getPosition(this.props.text, this.props.height)),
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.height !== this.props.height) {
      this.setState({
        animation: new Animated.Value(getPosition(nextProps.text, nextProps.height)),
      });
    }
  }
  componentDidUpdate(prevProps) {
    const { height } = this.props;

    if (prevProps.text !== this.props.text) {
      Animated.timing(this.state.animation, {
        toValue: getPosition(this.props.text, height),
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }

  render() {
    const { animation, height } = this.state;
    const { textStyle } = this.props;
    return (
      <View style={{ height, overflow: "hidden" }}>
        <Animated.View style={getAnimationStyle(animation)}>
          {measureText.map(v => (
            <Text key={v} style={textStyle} includeFontPadding={false}>
              {v}
            </Text>
          ))}
        </Animated.View>
      </View>
    );
  }
}

export default RotateText;
