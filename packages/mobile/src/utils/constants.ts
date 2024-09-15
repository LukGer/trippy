import type { WithSpringConfig } from "react-native-reanimated";

type SpringConfigs = {
  [key: string]: WithSpringConfig;
};

export const SPRING = {
  smooth: { duration: 1000, dampingRatio: 1 },
} satisfies SpringConfigs;
