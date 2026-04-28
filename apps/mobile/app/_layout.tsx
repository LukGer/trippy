import {
	Newsreader_400Regular,
	Newsreader_600SemiBold,
	Newsreader_700Bold,
} from "@expo-google-fonts/newsreader";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TrippyApiProvider } from "@/src/utils/trpc";
import "react-native-reanimated";
import "../global.css";

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
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
				<ThemeProvider
					value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
				>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="(tabs)" />
					</Stack>
					<StatusBar style="auto" />
				</ThemeProvider>
			</TrippyApiProvider>
		</KeyboardProvider>
	);
}
