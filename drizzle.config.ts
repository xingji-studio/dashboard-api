import { defineConfig } from "drizzle-kit";

const envContent = Deno.readTextFileSync(".env");
const env = Object.fromEntries(
    envContent.split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.split("=")),
);

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.ts",
    dialect: "sqlite",
    dbCredentials: {
        url: env.DB_PATH || "file:./db.sqlite",
    },
});
