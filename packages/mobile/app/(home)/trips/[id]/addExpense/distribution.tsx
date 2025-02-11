import { router, Stack } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AddExpenseContext } from "./_layout";

const DistributionPage = () => {
	const { expense } = useContext(AddExpenseContext);

	return (
		<>
			<Stack.Screen
				options={{
					title: `${expense.amount} €`,
					headerBackTitle: "Back",
					headerTitle: () => (
						<View style={{ alignItems: "center" }}>
							<Text style={{ fontWeight: "bold", fontSize: 18 }}>
								{expense.amount} €
							</Text>
							<Text>{expense.recipientIds.length} People</Text>
						</View>
					),
					headerRight: () => (
						<TouchableOpacity
							onPress={() => {
								router.replace("/(home)/trips/[id]/(tabs)/chat");
							}}
						>
							<Text style={{ color: "blue", fontWeight: "bold" }}>Save</Text>
						</TouchableOpacity>
					),
				}}
			/>
			<View style={styles.page}>
				<Text>Distribution Page</Text>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	page: {
		paddingTop: 26,
		paddingHorizontal: 26,
		alignItems: "center",
		gap: 24,
	},
	container: {
		backgroundColor: "white",
		borderRadius: 10,
		borderCurve: "continuous",
		overflow: "hidden",
	},
	seperator: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: "rgba(84, 84, 86, 0.33)",
		marginStart: 16,
	},
	item: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
		gap: 8,
	},
});

export default DistributionPage;
