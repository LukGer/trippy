import { ScrollView, StyleSheet, Text } from "react-native";

export default function YouScreen() {
	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>You</Text>
			<Text style={styles.description}>
				Manage your profile, preferences, and account settings.
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
