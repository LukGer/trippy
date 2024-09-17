import type { ExpoConfig } from "@expo/config-types";

const variant = process.env.APP_VARIANT ?? "dev";

export default (): ExpoConfig => ({
	name: variant === "prd" ? "Trippy" : `Trippy (${variant})`,
	slug: "trippy",
	version: "1.0.0",
	platforms: ["ios"],
	orientation: "portrait",
	icon: `./assets/images/icon_${variant}.png`,
	scheme: `trippy-${variant}`,
	userInterfaceStyle: "light",
	splash: {
		image: "./assets/images/splash.png",
		resizeMode: "contain",
		backgroundColor: "#ffffff",
	},
	ios: {
		bundleIdentifier: `dev.lukger.trippy.${variant}`,
	},
	plugins: [
		"expo-router",
		[
			"expo-font",
			{
				fonts: ["./assets/fonts/quiny.ttf"],
			},
		],
		[
			"expo-image-picker",
			{
				photosPermission:
					"The app accesses your photos to let you customize a trips image.",
			},
		],
	],
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
