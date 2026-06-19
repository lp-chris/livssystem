/**
 * Bruk: node scripts/generer-passord-hash.mjs DITTPASSORD
 * Kopier outputen inn i .env.local som ADMIN_PASSWORD_HASH
 * (base64-kodet for å unngå $-tegn som Next.js feiltolker)
 */
import bcrypt from "bcryptjs";

const passord = process.argv[2];
if (!passord) {
  console.error("Bruk: node scripts/generer-passord-hash.mjs DITTPASSORD");
  process.exit(1);
}

const hash = await bcrypt.hash(passord, 12);
const b64 = Buffer.from(hash).toString("base64");
console.log(b64);
