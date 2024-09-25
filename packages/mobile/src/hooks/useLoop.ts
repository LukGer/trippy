import { useEffect } from "react";
import {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const useLoop = (duration: number, reverse = false) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: duration / 2, easing: Easing.linear }),
      -1, // Infinite repetitions
      reverse
    );
  }, [progress, duration, reverse]);

  return progress;
};
