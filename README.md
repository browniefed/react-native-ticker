# React Native Ticker

Create rotating animations.

Can work with any number as well as other symbols like `$,.-`, etc.

```
yarn add react-native-ticker
npm install react-native-ticker
```

```js
import RotateText from "react-native-ticker";

// As a text prop
<RotateText text={"1235.44"} textStyle={styles.text} rotateTime={250} />;

// Or as a child
<RotateText textStyle={styles.text} rotateTime={250}>
  12345.44
</RotateText>

```

Supply a `textStyle`, as well as `text`.

`rotateTime` is optional and defaults to `250ms`.

![](./examples.gif)
