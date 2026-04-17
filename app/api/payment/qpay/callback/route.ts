import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { checkPayment } from "@/lib/qpay";

// QPay энэ endpoint руу POST илгээнэ
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const invoiceId = body?.invoice_id ?? body?.payment?.invoice_id;

  if (!invoiceId) {
    return Response.json({ error: "invoice_id байхгүй" }, { status: 400 });
  }

  const sub = await db.subscription.findUnique({ where: { invoiceId } });
  if (!sub || sub.status === "PAID") {
    return Response.json({ status: "ok" });
  }

  // QPay-с баталгаажуулах
  const paid = await checkPayment(invoiceId);
  if (paid) {
    await db.$transaction([
      db.subscription.update({
        where: { invoiceId },
        data: { status: "PAID", paidAt: new Date() },
      }),
      db.user.update({
        where: { id: sub.userId },
        data: { subscribed: true },
      }),
    ]);
  }

  return Response.json({ status: "ok" });
}
