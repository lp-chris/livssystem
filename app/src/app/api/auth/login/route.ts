import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { verifyPassword, getPasswordHash } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: "Passord mangler" }, { status: 400 });
  }

  try {
    const hash = getPasswordHash();
    const ok = await verifyPassword(password, hash);

    if (!ok) {
      return NextResponse.json({ error: "Feil passord" }, { status: 401 });
    }

    const session = await getSession();
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Login-feil:", err);
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}
