import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password, name } = body as Record<string, string>;

  if (!email || !password || !name) {
    return Response.json({ error: "Бүх талбарыг бөглөнө үү" }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json(
      { error: "Нууц үг хамгийн багадаа 8 тэмдэгт байна" },
      { status: 400 }
    );
  }

  try {
    const existing = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return Response.json(
        { error: "Энэ имэйл аль хэдийн бүртгэлтэй байна" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { email: email.trim().toLowerCase(), name: name.trim(), passwordHash },
      select: { id: true, email: true, name: true },
    });

    return Response.json(user, { status: 201 });
  } catch (e) {
    console.error("[register]", e);
    const message = process.env.NODE_ENV === "development"
      ? String(e)
      : "Серверийн алдаа гарлаа";
    return Response.json({ error: message }, { status: 500 });
  }
}
