import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: new URL("../../../.env", import.meta.url) });

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/dem-niem-tin"),
  MONGODB_DB_NAME: z.string().min(1).default("dem-niem-tin-dev"),
});

export const env = envSchema.parse(process.env);
