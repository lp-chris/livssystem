/**
 * Bruk: node scripts/generer-passord-hash.mjs DITTPASSORD
 * Kopier outputen inn i .env.local som ADMIN_PASSWORD_HASH
 */
import bcrypt from "bcryptjs";

const passord = process.argv[2];
if (!passord) {
  console.error("Bruk: node scripts/generer-passord-hash.mjs DITTPASSORD");
  process.exit(1);
}

const hash = await bcrypt.hash(passord, 12);
console.log(hash);
