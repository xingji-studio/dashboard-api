import { Hono } from "hono";
import { eq, or } from "drizzle-orm";
import response from "./src/utils/response.ts";
import { db } from "./src/db/index.ts";
import { users } from "./src/db/schema.ts";
import { hashPassword } from "./src/utils/encrypt.ts";

const app = new Hono();

app.get("/ping", (c) => {
    return response(c, true);
});

app.post("/register", async (c) => {
    const body = await c.req.json<{ name: string; email: string; password: string }>();

    if (!body.name || !body.email || !body.password) {
        return response(c, false, null, "Missing required fields", 400);
    }

    const existing = await db.query.users.findFirst({
        where: or(eq(users.name, body.name), eq(users.email, body.email)),
    });

    if (existing) {
        if (existing.name === body.name) return response(c, false, null, "Username already taken", 409);
        if (existing.email === body.email) return response(c, false, null, "Email already registered", 409);
    }

    const hashed = await hashPassword(body.password);

    await db.insert(users).values({
        name: body.name,
        email: body.email,
        password: hashed,
    });

    return response(c, true, null, "Registered successfully", 201);
});

function handleExit() {
    console.log("\n\nClosing database connection...");
    db.$client.close();
    console.log("Closed. Bye!\n");
    process.exit(0);
}
process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
process.on("SIGHUP", handleExit);

Deno.serve(app.fetch);
