import {
	Newsreader_400Regular,
	Newsreader_600SemiBold,
	Newsreader_700Bold,
} from "@expo-google-fonts/newsreader";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { TrippyApiProvider } from "@/src/utils/trpc";
import "react-native-reanimated";
import "../global.css";

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
	anchor: "(authed)/(tabs)",
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
		<GestureHandlerRootView style={{ flex: 1 }}>
			<KeyboardProvider preload={false}>
				<TrippyApiProvider>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="index" />
						<Stack.Screen name="(authed)" />
						<Stack.Screen name="(unauthed)" />
					</Stack>
				</TrippyApiProvider>
			</KeyboardProvider>
		</GestureHandlerRootView>
	);
}
