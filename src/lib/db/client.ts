import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.POSTGRES_URL!);
export const db = drizzle(sql, { schema });
export type DB = typeof db;

// Raw SQL client for shipping service
export function getDb() {
  return neon(process.env.POSTGRES_URL!);
}
