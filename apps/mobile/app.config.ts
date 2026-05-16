import type { ConfigContext, ExpoConfig } from "expo/config";

type Variant = "development" | "production";

function resolveVariant(): Variant {
	const raw = (process.env.VARIANT ?? process.env.INSTANCE ?? "").toLowerCase();
	if (raw === "development" || raw === "dev") return "development";
	return "production";
}

const variants = {
	development: {
		name: "Trippy (Dev)",
		bundleIdentifier: "dev.lukger.trippy.dev",
		icon: "./assets/images/icon.dev.png",
		scheme: "trippy-dev",
	},
	production: {
		name: "Trippy",
		bundleIdentifier: "dev.lukger.trippy",
		icon: "./assets/images/icon.png",
		scheme: "trippy",
	},
} as const;

export default ({ config }: ConfigContext): ExpoConfig => {
	const variant = resolveVariant();
	const v = variants[variant];

	return {
		...config,
		name: v.name,
		slug: "trippy",
		version: "1.0.0",
		orientation: "portrait",
		icon: v.icon,
		scheme: v.scheme,
		userInterfaceStyle: "automatic",
		ios: {
			supportsTablet: true,
			bundleIdentifier: v.bundleIdentifier,
			infoPlist: {
				ITSAppUsesNonExemptEncryption: false,
			},
		},
		plugins: [
			"react-native-nitro-fetch",
			"expo-router",
			[
				"expo-splash-screen",
				{
					image: "./assets/images/splash-icon.png",
					imageWidth: 200,
					resizeMode: "contain",
					backgroundColor: "#ffffff",
					dark: {
						backgroundColor: "#000000",
					},
				},
			],
			"expo-web-browser",
			"expo-font",
			"expo-image",
			"expo-secure-store",
		],
		experiments: {
			typedRoutes: true,
			reactCompiler: true,
		},
		extra: {
			apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787",
			variant,
			eas: {
				projectId: "fa384a87-5512-4aa7-a831-f26609c42d07",
			},
		},
	};
};
