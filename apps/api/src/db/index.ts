import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { Resource } from "sst";
import * as schema from "./schema";

config({ path: ".env" }); // or .env.local

const sql = neon(Resource.DatabaseUrl.value);
export const db = drizzle(sql, { schema });
