import { load } from "dotenv";
await load({ export: true });
import { Hono } from "hono";
import { eq, or } from "drizzle-orm";
import response from "./src/utils/response.ts";
import { db } from "./src/db/index.ts";
import { users } from "./src/db/schema.ts";
import { hashPassword, verifyPassword } from "./src/utils/encrypt.ts";
import { signJwt, verifyJwt } from "./src/utils/jwt.ts";

const app = new Hono();

app.get("/ping", (c) => {
    return response(c, true);
});

app.post("/register", async (c) => {
    const body = await c.req.json<
        { name: string; email: string; password: string }
    >();

    if (!body.name || !body.email || !body.password) {
        return response(c, false, null, "Missing required fields", 400);
    }

    const existing = await db.query.users.findFirst({
        where: or(eq(users.name, body.name), eq(users.email, body.email)),
    });

    if (existing) {
        if (existing.name === body.name) {
            return response(c, false, null, "Username already taken", 409);
        }
        if (existing.email === body.email) {
            return response(c, false, null, "Email already registered", 409);
        }
    }

    const hashed = await hashPassword(body.password);

    await db.insert(users).values({
        name: body.name,
        email: body.email,
        password: hashed,
    });

    return response(c, true, null, "Registered successfully", 201);
});

app.post("/login", async (c) => {
    const body = await c.req.json<{ email: string; password: string }>();
    if (!body.email || !body.password) {
        return response(c, false, null, "Missing required fields", 400);
    }

    const user = await db.query.users.findFirst({
        where: eq(users.email, body.email),
    });
    if (!user) {
        return response(c, false, null, "Invalid email or password", 401);
    }

    const valid = await verifyPassword(body.password, user.password);
    if (!valid) {
        return response(c, false, null, "Invalid email or password", 401);
    }

    const token = await signJwt({
        sub: user.id,
        name: user.name,
        email: user.email,
    });
    return response(c, true, {
        id: user.id,
        name: user.name,
        email: user.email,
        token,
    }, "Login successful");
});

app.get("/profile", async (c) => {
    const auth = c.req.header("Authorization");
    if (!auth?.startsWith("Bearer ")) {
        return response(c, false, null, "Missing or invalid token", 401);
    }

    try {
        const payload = await verifyJwt(auth.slice(7));
        const user = await db.query.users.findFirst({
            where: eq(users.id, Number(payload.sub)),
        });
        if (!user) {
            return response(c, false, null, "User not found", 404);
        }
        return response(c, true, {
            id: user.id,
            name: user.name,
            email: user.email,
        });
    } catch {
        return response(c, false, null, "Invalid token", 401);
    }
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
