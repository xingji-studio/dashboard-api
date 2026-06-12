import { defineConfig } from "drizzle-kit";
import { load } from "dotenv";
await load({ export: true });

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.ts",
    dialect: "sqlite",
    dbCredentials: {
        url: Deno.env.get("DB_PATH") || "file:./db.sqlite",
    },
});
