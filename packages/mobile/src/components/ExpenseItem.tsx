import type { Expense } from "@trippy/core/src/expense/expense";
import { Image } from "expo-image";
import { Fragment, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

export function ExpenseItem({ expense }: { expense: Expense.Info }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<Animated.View
			layout={LinearTransition}
			style={[
				{
					height: expanded ? "auto" : 56,
					overflow: "hidden",
					backgroundColor: "white",
					borderRadius: 10,
					borderCurve: "continuous",
					paddingHorizontal: 16,
					paddingVertical: 8,
					gap: 12,
				},
			]}
		>
			<TouchableOpacity
				style={styles.expenseItem}
				onPress={() => setExpanded(!expanded)}
			>
				<Image
					source={{ uri: expense.payer.pictureUrl ?? "" }}
					style={styles.userImg}
				/>
				<View className="flex flex-col">
					<Text className="font-bold">{expense.payer.name}</Text>

					<Text>
						payed for{" "}
						<Text className="font-bold">
							{expense.recipients.length} people
						</Text>
					</Text>
				</View>

				<View style={{ flex: 1 }} />

				<Text className="font-bold text-xl">
					{Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "USD",
					}).format(expense.amount)}
				</Text>
			</TouchableOpacity>

			<View style={{ flexDirection: "column", gap: 8 }}>
				{expense.recipients.map((recipient, index) => (
					<Fragment key={recipient.userId}>
						<View
							style={{
								height: 24,
								flexDirection: "row",
								alignItems: "center",
								marginStart: 16,
							}}
						>
							<Text>{recipient.user.name}</Text>

							<View style={{ flex: 1 }} />

							<Text>
								{Intl.NumberFormat("en-US", {
									style: "currency",
									currency: "USD",
								}).format(recipient.amount)}
							</Text>
						</View>

						{index < expense.recipients.length - 1 && (
							<View style={styles.seperator} />
						)}
					</Fragment>
				))}
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	expenseItem: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	seperator: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: "rgba(84, 84, 86, 0.33)",
		marginStart: 16,
	},
	userImg: {
		width: 42,
		height: 42,
		borderRadius: 99,
	},
});
