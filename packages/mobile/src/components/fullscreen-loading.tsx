import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Spinner } from "./spinner";

export function FullscreenLoading(props: { color?: string }) {
	const color = props.color ?? "#0000ff";

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<View style={styles.container}>
				<Spinner size={40} color={color} />
			</View>
		</>
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
