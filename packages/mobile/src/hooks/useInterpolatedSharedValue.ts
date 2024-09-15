import { useEffect } from "react";
import { Animated as RNAnimated } from "react-native";
import { useSharedValue } from "react-native-reanimated";

export const useInterpolatedSharedValue = (
  rnAnimatedValue: RNAnimated.AnimatedInterpolation<number>
) => {
  const sharedValue = useSharedValue(0);

  useEffect(() => {
    const id = rnAnimatedValue.addListener(({ value }) => {
      sharedValue.value = value;
    });

    return () => {
      rnAnimatedValue.removeListener(id);
    };
  }, [rnAnimatedValue]);

  return sharedValue;
};
