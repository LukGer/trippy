import { Stack } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/colors";

export default function CreatePlanScreen() {
	return (
		<>
			<Stack.Screen options={{ title: "Create Plan" }} />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={styles.container}
			>
				<Text style={styles.description}>Start a new travel plan.</Text>
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: Colors.surface.canvas,
		flexGrow: 1,
		padding: 24,
	},
	description: {
		color: Colors.ink.secondary,
		fontSize: 16,
		lineHeight: 22,
	},
});
