import bcrypt from "bcryptjs";

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function getPasswordHash(): string {
  const b64 = process.env.ADMIN_PASSWORD_HASH;
  if (!b64) throw new Error("ADMIN_PASSWORD_HASH ikke satt");
  return Buffer.from(b64, "base64").toString("utf8");
}
