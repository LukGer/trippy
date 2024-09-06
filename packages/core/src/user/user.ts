import { eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../drizzle";
import { fn } from "../util/fn";
import { createID } from "../util/id";
import { userTable } from "./user.sql";

export module User {
  export const Info = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    clerkId: z.string(),
    pictureUrl: z.string().nullable(),
  });

  export const create = fn(
    z.object({
      name: z.string(),
      email: z.string(),
      clerkId: z.string(),
      pictureUrl: z.string().nullable(),
    }),
    async (input) => {
      const id = createID("user");

      await db.insert(userTable).values({
        id,
        email: input.email,
        name: input.name,
        clerkId: input.clerkId,
        pictureUrl: input.pictureUrl,
      });

      return id;
    }
  );

  export const update = fn(
    Info.pick({ name: true, email: true, pictureUrl: true, id: true }).partial({
      name: true,
      email: true,
      pictureUrl: true,
    }),
    async (input) => {
      await db
        .update(userTable)
        .set({
          name: input.name,
          email: input.email,
          pictureUrl: input.pictureUrl,
        })
        .where(eq(userTable.id, input.id));
    }
  );

  export const fromClerkId = fn(z.string(), async (clerkId) =>
    db
      .select()
      .from(userTable)
      .where(eq(userTable.clerkId, clerkId))
      .then((rows) => rows.map(serialize).at(0))
  );

  export const fromSearchString = fn(z.string(), async (search) =>
    db
      .select()
      .from(userTable)
      .where(
        or(
          like(userTable.name, `%${search}%`),
          like(userTable.email, `%${search}%`)
        )
      )
      .then((rows) => rows.map(serialize))
  );

  function serialize(
    input: typeof userTable.$inferSelect
  ): z.infer<typeof Info> {
    return {
      id: input.id,
      name: input.name,
      email: input.email,
      clerkId: input.clerkId,
      pictureUrl: input.pictureUrl,
    };
  }
}
