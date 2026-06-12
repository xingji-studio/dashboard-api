const ITERATIONS = 1000;
const KEY_LENGTH = 64;
const DIGEST = "SHA-256";

function bufToHex(buf: Uint8Array | ArrayBuffer): string {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"],
    );
    const derived = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: ITERATIONS, hash: DIGEST },
        key,
        KEY_LENGTH * 8,
    );
    return `${bufToHex(salt)}:${bufToHex(derived)}`;
}

export async function verifyPassword(
    password: string,
    stored: string,
): Promise<boolean> {
    const [saltHex, hashHex] = stored.split(":");
    const salt = new Uint8Array(
        saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)),
    );
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"],
    );
    const derived = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: ITERATIONS, hash: DIGEST },
        key,
        KEY_LENGTH * 8,
    );
    return bufToHex(derived) === hashHex;
}
