import { ScrollView, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export default function DocumentsScreen() {
	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Documents</Text>
			<Text style={styles.description}>
				Keep tickets, bookings, passports, and trip attachments in one place.
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
