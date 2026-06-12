import { type JWTPayload, jwtVerify, SignJWT } from "jose";

function getSecret(): Uint8Array {
    const secret = Deno.env.get("JWT_SECRET");
    if (!secret) throw new Error("JWT_SECRET is not set");
    return new TextEncoder().encode(secret);
}

export interface JwtPayload extends JWTPayload {
    sub: number;
    name: string;
    email: string;
}

export async function signJwt(
    payload: Omit<JwtPayload, "iat" | "exp" | "jti">,
): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getSecret());
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as JwtPayload;
}
