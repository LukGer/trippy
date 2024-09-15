import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import { db } from "../drizzle";
import { userTable } from "../user/user.sql";
import { fn } from "../util/fn";
import { createID } from "../util/id";
import { expenseRecipientTable, expenseTable } from "./expense.sql";

export namespace Expense {
  export const Recipient = z.object({
    userId: z.string(),
    amount: z.number(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      pictureUrl: z.string().nullable(),
    }),
  });

  export type Recipient = z.infer<typeof Recipient>;

  export const Info = z.object({
    id: z.string(),
    tripId: z.string(),
    payerId: z.string(),
    amount: z.number(),
    description: z.string().nullable(),
    createdAt: z.date(),
    recipients: z.array(Recipient),
    payer: z.object({
      id: z.string(),
      name: z.string(),
      pictureUrl: z.string().nullable(),
    }),
  });

  export type Info = z.infer<typeof Info>;

  export const create = fn(
    z.object({
      tripId: z.string(),
      payerId: z.string(),
      amount: z.number(),
      description: z.string().optional(),
      recipients: z.array(Recipient),
      createdAt: z.date(),
    }),
    async (input) => {
      const id = createID("expense");

      await db
        .insert(expenseTable)
        .values({
          id,
          tripId: input.tripId,
          payerId: input.payerId,
          amount: input.amount,
          description: input.description,
          createdAt: input.createdAt,
        })
        .execute();

      await db
        .insert(expenseRecipientTable)
        .values(
          input.recipients.map((recipient) => ({
            expenseId: id,
            userId: recipient.userId,
            amount: recipient.amount,
          }))
        )
        .execute();

      return { id };
    }
  );

  const payerTable = alias(userTable, "payer");

  export const fromTripId = fn(z.string(), async (tripId) => {
    return db
      .select({
        expense: expenseTable,
        payer: userTable,
        recipient: expenseRecipientTable,
        recipientUser: userTable,
      })
      .from(expenseTable)
      .innerJoin(payerTable, eq(expenseTable.payerId, payerTable.id))
      .leftJoin(
        expenseRecipientTable,
        eq(expenseRecipientTable.expenseId, expenseTable.id)
      )
      .leftJoin(userTable, eq(expenseRecipientTable.userId, userTable.id))
      .where(eq(expenseTable.tripId, tripId))
      .then((results) => {
        const map = new Map<string, Expense.Info>();

        for (const result of results) {
          if (!map.has(result.expense.id) && result.payer) {
            map.set(result.expense.id, {
              id: result.expense.id,
              tripId: result.expense.tripId,
              payerId: result.expense.payerId,
              amount: result.expense.amount,
              description: result.expense.description,
              createdAt: result.expense.createdAt,
              recipients: [],
              payer: {
                id: result.payer.id,
                name: result.payer.name,
                pictureUrl: result.payer.pictureUrl,
              },
            });
          }

          if (result.recipient && result.recipientUser) {
            const expense = map.get(result.expense.id);

            if (!expense) {
              continue;
            }

            expense.recipients.push({
              userId: result.recipient.userId,
              amount: result.recipient.amount,
              user: {
                id: result.recipientUser.id,
                name: result.recipientUser.name,
                pictureUrl: result.recipientUser.pictureUrl,
              },
            });
          }
        }

        return Array.from(map.values());
      });
  });
}
