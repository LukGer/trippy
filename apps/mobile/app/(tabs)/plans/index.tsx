import { ScrollView, StyleSheet, Text } from "react-native";

export default function PlansScreen() {
	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Plans</Text>
			<Text style={styles.description}>
				Organize trips, routes, and itinerary timelines.
			</Text>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		justifyContent: "center",
		padding: 24,
	},
	description: {
		color: "#687076",
		fontSize: 16,
		marginTop: 8,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
	},
});
