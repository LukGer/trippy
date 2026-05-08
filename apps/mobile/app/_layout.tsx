import {
	Newsreader_400Regular,
	Newsreader_600SemiBold,
	Newsreader_700Bold,
} from "@expo-google-fonts/newsreader";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { TrippyApiProvider } from "@/src/utils/trpc";
import "react-native-reanimated";
import "../global.css";

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		Newsreader_400Regular,
		Newsreader_600SemiBold,
		Newsreader_700Bold,
	});

	useEffect(() => {
		if (fontsLoaded) {
			void SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<KeyboardProvider preload={false}>
			<TrippyApiProvider>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="(tabs)" />
					<Stack.Screen name="plans" options={{ presentation: "formSheet" }} />
				</Stack>
			</TrippyApiProvider>
		</KeyboardProvider>
	);
}
