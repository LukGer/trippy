import { and, desc, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { db } from "../drizzle";
import { userTable } from "../user/user.sql";
import { fn } from "../util/fn";
import { createID } from "../util/id";
import { messageTable } from "./message.sql";

export namespace Message {
	const User = z.object({
		id: z.string(),
		name: z.string(),
	});

	export const UserMessage = z.object({
		id: z.string(),
		tripId: z.string(),
		userId: z.string(),
		type: z.literal("chat"),
		content: z.string().nullable(),
		createdAt: z.date(),
		user: User,
	});

	export type UserMessage = z.infer<typeof UserMessage>;

	export const ExpenseMessage = z.object({
		id: z.string(),
		tripId: z.string(),
		type: z.literal("expense"),
		userId: z.string(),
		amount: z.number(),
		currency: z.string(),
		createdAt: z.date(),
		user: User,
	});

	export type ExpenseMessage = z.infer<typeof ExpenseMessage>;

	export const SystemMessage = z.object({
		id: z.string(),
		type: z.literal("system"),
		content: z.string(),
		createdAt: z.date(),
	});

	export type SystemMessage = z.infer<typeof SystemMessage>;

	export const Info = z.union([UserMessage, ExpenseMessage, SystemMessage]);

	export type Info = z.infer<typeof Info>;

	export const getByTripIdFromTo = fn(
		z.object({
			tripId: z.string(),
			start: z.date(),
			limit: z.number(),
		}),
		async ({ tripId, start, limit }) => {
			return db
				.select()
				.from(messageTable)
				.innerJoin(userTable, eq(messageTable.userId, userTable.id))
				.where(
					and(
						eq(messageTable.tripId, tripId),
						lt(messageTable.createdAt, start),
					),
				)
				.orderBy(desc(messageTable.createdAt))
				.limit(limit)
				.then((results) => {
					const map = new Map<string, Message.Info>();

					for (const result of results) {
						if (!map.has(result.messages.id) && result.users) {
							map.set(result.messages.id, {
								id: result.messages.id,
								tripId: result.messages.tripId,
								userId: result.messages.userId,
								type: "chat",
								content: result.messages.content,
								createdAt: result.messages.createdAt,
								user: {
									id: result.users.id,
									name: result.users.name,
								},
							});
						}
					}

					return Array.from(map.values());
				});
		},
	);

	export const create = fn(
		z.object({
			tripId: z.string(),
			userId: z.string(),
			content: z.string().nullable(),
		}),
		async ({ tripId, userId, content }) => {
			const id = createID("message");

			await db.insert(messageTable).values({
				id,
				tripId,
				userId,
				type: "chat",
				content,
				createdAt: new Date(),
			});
		},
	);

	export const deleteById = fn(
		z.object({
			userId: z.string(),
			messageId: z.string(),
		}),
		async ({ userId, messageId }) => {
			const message = (
				await db
					.select()
					.from(messageTable)
					.where(eq(messageTable.id, messageId))
			).at(0);

			if (!message || message.userId !== userId) {
				throw new Error("Unauthorized");
			}

			await db.delete(messageTable).where(eq(messageTable.id, messageId));
		},
	);
}
