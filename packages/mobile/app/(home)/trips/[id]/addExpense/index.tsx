import { useTrip } from "@/src/hooks/useTrip";
import { useTrippyUser } from "@/src/hooks/useTrippyUser";
import type { RouterOutputs } from "@trippy/api";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { Fragment, useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CurrencyInput from "react-native-currency-input";
import { AddExpenseContext, type DistributionWay } from "./_layout";

type Trip = RouterOutputs["trips"]["getById"];
type Member = Trip["members"][number];

const AddExpensePage = () => {
	const user = useTrippyUser();
	const trip = useTrip();
	const { setExpense } = useContext(AddExpenseContext);

	const [amount, setAmount] = React.useState<number | null>(0);
	const [selectedMembers, setSelectedMembers] = React.useState<Member[]>([]);
	const [distributionWay, setDistributionWay] =
		React.useState<DistributionWay | null>(null);

	const navigateToDistribution = () => {
		if (!distributionWay) return;

		setExpense({
			amount: amount ?? 0,
			payerId: user.id,
			recipientIds: selectedMembers.map((m) => m.id),
			distributionWay,
		});

		router.navigate("/(home)/trips/[id]/addExpense/distribution");
	};

	return (
		<>
			<Stack.Screen
				options={{
					title: "Add new expense",
					headerLeft: (props) => (
						<TouchableOpacity {...props} onPress={() => router.back()}>
							<Text style={{ fontWeight: "bold" }}>Cancel</Text>
						</TouchableOpacity>
					),
					headerRight: (props) => (
						<TouchableOpacity
							{...props}
							onPress={() => navigateToDistribution()}
						>
							<Text style={{ fontWeight: "bold" }}>Next</Text>
						</TouchableOpacity>
					),
				}}
			/>
			<View style={styles.page}>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
					<CurrencyInput
						value={amount}
						onChangeValue={(e) => setAmount(e)}
						style={styles.amount}
						placeholder="0.00"
					/>

					<Text style={styles.amount}>€</Text>
				</View>

				<View style={styles.container}>
					{trip.members.map((member, index) => (
						<Fragment key={member.id}>
							<UserItem
								member={member}
								isSelected={selectedMembers.includes(member)}
								onSelect={(selected) => {
									if (selected) {
										setSelectedMembers([...selectedMembers, member]);
									} else {
										setSelectedMembers(
											selectedMembers.filter((m) => m !== member),
										);
									}
								}}
							/>
							{index < trip.members.length - 1 && (
								<View style={styles.seperator} />
							)}
						</Fragment>
					))}
				</View>

				<View style={styles.container}>
					<DistributionWayItem
						distributionWay="equal"
						isSelected={distributionWay === "equal"}
						onSelect={(selected) => {
							if (selected) {
								setDistributionWay(null);
							} else {
								setDistributionWay("equal");
							}
						}}
					/>
				</View>
			</View>
		</>
	);
};

const UserItem = ({
	member,
	isSelected,
	onSelect,
}: {
	member: Member;
	isSelected: boolean;
	onSelect: (selected: boolean) => void;
}) => {
	return (
		<TouchableOpacity style={styles.item} onPress={() => onSelect(!isSelected)}>
			<Image style={styles.userImg} source={{ uri: member.pictureUrl ?? "" }} />

			<Text>{member.name}</Text>

			<View style={{ flex: 1 }} />

			<SymbolView
				name={isSelected ? "checkmark.circle.fill" : "circle"}
				size={24}
				resizeMode="scaleAspectFit"
			/>
		</TouchableOpacity>
	);
};

const DistributionWayItem = ({
	distributionWay,
	isSelected,
	onSelect,
}: {
	distributionWay: DistributionWay;
	isSelected: boolean;
	onSelect: (selected: boolean) => void;
}) => {
	<TouchableOpacity style={styles.item} onPress={() => onSelect(!isSelected)}>
		<Text>{distributionWay}</Text>

		<View style={{ flex: 1 }} />

		<SymbolView
			name={isSelected ? "checkmark.circle.fill" : "circle"}
			size={24}
			resizeMode="scaleAspectFit"
		/>
	</TouchableOpacity>;
};

const styles = StyleSheet.create({
	page: {
		paddingTop: 26,
		paddingHorizontal: 26,
		alignItems: "center",
		gap: 24,
	},
	amount: {
		fontSize: 40,
		fontWeight: "bold",
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
	userImg: {
		width: 42,
		height: 42,
		borderRadius: 99,
	},
});

export default AddExpensePage;
