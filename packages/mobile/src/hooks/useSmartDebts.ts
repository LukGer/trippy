import type { Expense } from "@trippy/core/src/expense/expense";
import { useMemo } from "react";

export type Transfer = {
	from: SimpleUser;
	to: SimpleUser;
	amount: number;
};

export type SimpleUser = Expense.Info["payer"];

export const useSmartTransfers = (expenses: Expense.Info[]) => {
	const transfers = useMemo(() => {
		const result: Transfer[] = [];
		const spenders: { user: SimpleUser; amount: number }[] = [];
		const receivers: { user: SimpleUser; amount: number }[] = [];

		for (const expense of expenses) {
			const spenderId = expense.payer.id;

			const spender = spenders.find((s) => s.user.id === spenderId);
			if (!spender) {
				spenders.push({ user: expense.payer, amount: expense.amount });
			} else {
				spender.amount += expense.amount;
			}

			for (const recipient of expense.recipients) {
				const receiverId = recipient.userId;

				const receiver = receivers.find((r) => r.user.id === receiverId);
				if (!receiver) {
					receivers.push({ user: recipient.user, amount: -recipient.amount });
				} else {
					receiver.amount -= recipient.amount;
				}
			}
		}

		const orderedSpenders = spenders.sort((a, b) => b.amount - a.amount);
		const orderedReceivers = receivers.sort((a, b) => b.amount - a.amount);

		for (const spender of orderedSpenders) {
			for (const receiver of orderedReceivers) {
				if (spender.user.id === receiver.user.id) {
					continue;
				}

				if (spender.amount > 0 && receiver.amount < 0) {
					const transferAmount = Math.min(spender.amount, -receiver.amount);
					result.push({
						from: receiver.user,
						to: spender.user,
						amount: transferAmount,
					});
					spender.amount -= transferAmount;
					receiver.amount += transferAmount;
				}
			}
		}

		return result;
	}, [expenses]);

	return transfers;
};
