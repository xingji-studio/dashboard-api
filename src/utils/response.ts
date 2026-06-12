import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export default function response(
    c: Context,
    ok: boolean,
    data: object | null = null,
    message: string | null = null,
    statusCode: ContentfulStatusCode = 200,
) {
    const body: Record<string, unknown> = { ok };
    if (data !== null) {
        body.data = data;
    }
    if (message !== null) {
        body.message = message;
    }
    return c.json(body, statusCode);
}
