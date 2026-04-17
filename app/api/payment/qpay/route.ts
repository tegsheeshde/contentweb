import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createInvoice, checkPayment } from "@/lib/qpay";

const AMOUNT = 9900;

// POST /api/payment/qpay — нэхэмжлэл үүсгэх
export async function POST(_request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id!;

  // Аль хэдийн төлсөн эсэхийг шалгах
  const user = await db.user.findUnique({ where: { id: userId } });
  if (user?.subscribed) {
    return Response.json({ error: "Аль хэдийн захиалгатай байна" }, { status: 409 });
  }

  try {
    const invoice = await createInvoice({
      invoiceCode: process.env.QPAY_INVOICE_CODE!,
      senderInvoiceNo: `SUB_${userId}_${Date.now()}`,
      receiverCode: session.user.email!,
      description: "ContentWeb сарын захиалга — 9,900₮",
      amount: AMOUNT,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/qpay/callback`,
    });

    // Нэхэмжлэлийг DB-д хадгалах
    await db.subscription.create({
      data: {
        userId,
        invoiceId: invoice.invoice_id,
        amount: AMOUNT,
        status: "PENDING",
      },
    });

    return Response.json(invoice);
  } catch (e) {
    console.error("[qpay create]", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}

// GET /api/payment/qpay?invoice_id=xxx — frontend polling
export async function GET(request: NextRequest) {
  const invoiceId = request.nextUrl.searchParams.get("invoice_id");
  if (!invoiceId) {
    return Response.json({ error: "invoice_id шаардлагатай" }, { status: 400 });
  }

  const sub = await db.subscription.findUnique({ where: { invoiceId } });
  if (!sub) {
    return Response.json({ error: "Нэхэмжлэл олдсонгүй" }, { status: 404 });
  }

  if (sub.status === "PAID") {
    return Response.json({ status: "PAID" });
  }

  // QPay-с шалгах
  try {
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
      return Response.json({ status: "PAID" });
    }
  } catch (e) {
    console.error("[qpay check]", e);
  }

  return Response.json({ status: "PENDING" });
}
