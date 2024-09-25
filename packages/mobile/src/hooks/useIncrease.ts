import { useEffect } from "react";
import {
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const useIncrease = (stepDuration: 1000) => {
  const sharedValue = useSharedValue(0);

  useEffect(() => {
    // Increment the shared value by 1 over the given stepDuration, repeat indefinitely
    sharedValue.value = withRepeat(
      withTiming(sharedValue.value + 1, { duration: stepDuration }), // Increment by 1 every stepDuration ms
      -1, // Repeat indefinitely
      false // No reverse
    );
  }, [stepDuration]);

  return sharedValue;
};
