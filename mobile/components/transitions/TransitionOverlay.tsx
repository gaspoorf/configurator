import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet } from "react-native";

const { height } = Dimensions.get("window");

const TransitionOverlay = forwardRef((props, ref) => {
  const translateY = useRef(new Animated.Value(height)).current;

  useImperativeHandle(ref, () => ({
    play: (onMiddle: () => void) => {

        Animated.timing(translateY, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
        }).start(() => {
            
            onMiddle?.();

            setTimeout(() => {
                Animated.timing(translateY, {
                    toValue: height,
                    duration: 800,
                    useNativeDriver: true,
                }).start();
            }, 3000);
        });
    },
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { transform: [{ translateY }] }
      ]}
    >
      <Image
        source={require("../../assets/img/hero-crop.png")}
        style={styles.image}
        resizeMode="cover"
      />
    </Animated.View>
  );
});

export default TransitionOverlay;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0, left: 0,
    width: "100%",
    height: "110%",
    zIndex: 9999,
  },
  image: {
    width: "100%",
    height: "130%",
  },
});
