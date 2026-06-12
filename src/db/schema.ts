import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    registerTime: integer("register_time", { mode: "timestamp" }).$default(() =>
        new Date()
    ),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
