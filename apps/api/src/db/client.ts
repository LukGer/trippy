import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import * as authSchema from "../auth/schema";
import * as appSchema from "./schema";

const schema = {
  ...authSchema,
  ...appSchema,
};

export function createDb(database: D1Database) {
  return drizzle(database, { schema });
}

export type Db = ReturnType<typeof createDb>;
