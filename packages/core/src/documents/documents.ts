import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../drizzle";
import { User } from "../user/user";
import { userTable } from "../user/user.sql";
import { fn } from "../util/fn";
import { documentsTable } from "./documents.sql";

export namespace Documents {
  export const Info = z.object({
    id: z.string(),
    tripId: z.string(),
    userId: z.string(),
    passportNumber: z.string(),
    passportExpiry: z.date(),
    user: User.SimpleUser,
  });

  export type Info = z.infer<typeof Info>;

  export const getByTripId = fn(z.string(), async (input) => {
    return await db
      .select()
      .from(documentsTable)
      .innerJoin(userTable, eq(documentsTable.userId, userTable.id))
      .where(eq(documentsTable.tripId, input))
      .then((rows) => {
        return rows.map((row) => {
          return Info.parse({
            id: row.documents.id,
            tripId: row.documents.tripId,
            userId: row.documents.userId,
            passportNumber: row.documents.passportNumber,
            passportExpiry: row.documents.passportExpiry,
            user: User.SimpleUser.parse({
              id: row.users.id,
              email: row.users.email,
            }),
          });
        });
      });
  });
}
