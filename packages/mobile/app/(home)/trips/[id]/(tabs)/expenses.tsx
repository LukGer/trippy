import { ExpenseItem } from "@/src/components/expense-item";
import {
	type Transfer,
	useSmartTransfers,
} from "@/src/hooks/useSmartTransfers";
import { useTrip } from "@/src/hooks/useTrip";
import { useTrippyUser } from "@/src/hooks/useTrippyUser";
import { TrippyTabs } from "@/src/navigation/trippy-tabs";
import { trpc } from "@/src/utils/trpc";
import type { Expense } from "@trippy/core/src/expense/expense";
import { SymbolView } from "expo-symbols";
import { Fragment } from "react";
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

export default function ExpensesPage() {
	const trip = useTrip();

	const { isLoading, data, refetch } = trpc.expenses.getByTripId.useQuery(
		trip.id,
	);

	if (isLoading) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<TrippyTabs.Screen
				options={{
					title: "Expenses",
				}}
			/>
			<ScrollView
				refreshControl={
					<RefreshControl refreshing={isLoading} onRefresh={refetch} />
				}
				style={{
					paddingTop: 16,
					paddingHorizontal: 16,
				}}
				contentContainerStyle={{
					gap: 24,
					alignItems: "center",
				}}
			>
				{!data || data.length === 0 ? (
					<EmptyState />
				) : (
					<>
						<DebtsList expenses={data} />

						<ExpensesList expenses={data} />
					</>
				)}
			</ScrollView>
		</>
	);
}

function EmptyState() {
	return (
		<View
			style={{
				height: "50%",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<SymbolView
				//@ts-expect-error - SymbolView not yet updated
				name="wallet.bifold"
				style={{ width: 100, height: 100 }}
				resizeMode="scaleAspectFit"
				tintColor="black"
			/>
			<Text className="font-bold text-lg">No expenses yet</Text>
		</View>
	);
}

function ExpensesList({ expenses }: { expenses: Expense.Info[] }) {
	return (
		<View style={{ gap: 12, width: "100%" }}>
			<Text className="self-start font-bold text-gray-500">Expenses</Text>
			<Animated.View layout={LinearTransition}>
				{expenses.map((expense) => (
					<ExpenseItem key={expense.id} expense={expense} />
				))}
			</Animated.View>
		</View>
	);
}

function DebtsList({ expenses }: { expenses: Expense.Info[] }) {
	const transfers = useSmartTransfers(expenses);

	return (
		<View style={{ gap: 12, width: "100%" }}>
			<Text className="self-start font-bold text-gray-500">Open payments</Text>
			<View style={styles.container}>
				{transfers.map((transfer, index) => (
					<Fragment key={transfer.from.name + transfer.to.name}>
						<TransferItem
							key={transfer.from.name + transfer.to.name}
							transfer={transfer}
						/>

						{index < transfers.length - 1 && <View style={styles.seperator} />}
					</Fragment>
				))}
			</View>
		</View>
	);
}

function TransferItem({ transfer }: { transfer: Transfer }) {
	const user = useTrippyUser();

	const from =
		transfer.from.id === user.id ? "You" : getShortName(transfer.from.name);
	const owes = transfer.from.id === user.id ? "owe" : "owes";
	const to =
		transfer.to.id === user.id ? "You" : getShortName(transfer.to.name);

	return (
		<View style={styles.expenseItem}>
			<SymbolView
				name="arrow.left.arrow.right"
				style={{ width: 20, height: 20 }}
				resizeMode="scaleAspectFit"
				tintColor="black"
			/>

			<View className="flex flex-row items-center gap-1">
				<Text className="font-bold">{from}</Text>
				<Text>{owes}</Text>
				<Text className="font-bold">{to}</Text>
			</View>

			<View style={{ flex: 1 }} />

			<Text className="font-bold text-xl">
				{Intl.NumberFormat("en-US", {
					style: "currency",
					currency: "USD",
				}).format(transfer.amount)}
			</Text>
		</View>
	);
}

function getShortName(name: string) {
	const nameParts = name.split(" ");
	if (nameParts.length === 2) {
		return `${nameParts[0]} ${nameParts[1][0]}.`;
	}
	return name;
}

const styles = StyleSheet.create({
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
		height: 44,
		gap: 8,
	},
	itemTitle: {
		fontWeight: "500",
	},
	expenseItem: {
		width: "100%",
		backgroundColor: "white",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 10,
		borderCurve: "continuous",
		gap: 12,
	},
	userImg: {
		width: 42,
		height: 42,
		borderRadius: 99,
	},
});
