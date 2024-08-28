import { ExpoConfig } from "@expo/config-types";

const variant = process.env.APP_VARIANT ?? "dev";

export default (): ExpoConfig => ({
  name: `trippy-${variant}`,
  slug: "trippy",
  version: "1.0.0",
  platforms: ["ios"],
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "trippy-app",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: `dev.lukger.trippy.${variant}`,
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "fa384a87-5512-4aa7-a831-f26609c42d07",
    },
  },
});
