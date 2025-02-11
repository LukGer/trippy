import { Stack } from "expo-router";
import React, { createContext } from "react";

export type DistributionWay = "equal" | "percentage" | "discrete";

export type Expense = {
	amount: number;
	payerId: string;
	recipientIds: string[];
	distributionWay: DistributionWay;
};

export const AddExpenseContext = createContext<{
	expense: Expense;
	setExpense: (expense: Expense) => void;
}>(null!);

export default function Layout() {
	const [expense, setExpense] = React.useState<Expense>({
		amount: 0,
		payerId: "",
		recipientIds: [],
		distributionWay: "equal",
	});

	return (
		<AddExpenseContext.Provider
			value={{
				expense,
				setExpense: (expense) => setExpense(expense),
			}}
		>
			<Stack />
		</AddExpenseContext.Provider>
	);
}
