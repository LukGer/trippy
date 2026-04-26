import { ScrollView, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

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
		backgroundColor: Colors.surface.canvas,
		flexGrow: 1,
		justifyContent: "center",
		padding: 24,
	},
	description: {
		color: Colors.ink.secondary,
		fontSize: 16,
		marginTop: 8,
	},
	title: {
		color: Colors.ink.primary,
		fontFamily: Fonts.serif.bold,
		fontSize: 32,
	},
});
