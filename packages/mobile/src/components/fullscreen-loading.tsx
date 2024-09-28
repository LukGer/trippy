import { ActivityIndicator, StyleSheet, View } from "react-native";

export function FullscreenLoading(props: { color?: string }) {
	const color = props.color ?? "#0000ff";

	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color={color} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
});
