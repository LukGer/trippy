import { Stack } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export default function DiscoverScreen() {
	return (
		<>
			<Stack.Screen
				options={{
					title: "Discover",
					headerBlurEffect: "none",
					headerStyle: { backgroundColor: Colors.surface.canvas },
					headerLargeStyle: { backgroundColor: "transparent" },
					headerLargeTitle: true,
					headerLargeTitleShadowVisible: false,
					headerShadowVisible: false,
					headerTitleStyle: { color: Colors.ink.primary },
					headerTransparent: true,
				}}
			/>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={styles.container}
			>
				<Text style={styles.title}>Where should we go next?</Text>
				<Text style={styles.description}>
					Find ideas, places, and inspiration for your next trip.
				</Text>
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: Colors.surface.canvas,
		flexGrow: 1,
		paddingHorizontal: 24,
		paddingTop: 24,
	},
	description: {
		color: Colors.ink.secondary,
		fontSize: 18,
		lineHeight: 26,
		marginTop: 16,
		maxWidth: 320,
	},
	title: {
		color: Colors.ink.primary,
		fontFamily: Fonts.serif.bold,
		fontSize: 40,
		letterSpacing: -0.8,
		lineHeight: 44,
		maxWidth: 340,
	},
});
