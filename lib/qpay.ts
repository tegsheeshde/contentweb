const QPAY_BASE_URL = "https://merchant.qpay.mn/v2";

// Token cache — expires_in секундээр ирдэг тул 5 минут өмнө шинэчилнэ
let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getQPayToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const res = await fetch(`${QPAY_BASE_URL}/auth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`
      ).toString("base64")}`,
    },
  });

  if (!res.ok) throw new Error(`QPay auth failed: ${res.status}`);
  const data = await res.json();

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return cachedToken.value;
}

export async function createInvoice(params: {
  invoiceCode: string;
  senderInvoiceNo: string;
  receiverCode: string;
  description: string;
  amount: number;
  callbackUrl: string;
}) {
  const token = await getQPayToken();

  const res = await fetch(`${QPAY_BASE_URL}/invoice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_code: params.invoiceCode,
      sender_invoice_no: params.senderInvoiceNo,
      invoice_receiver_code: params.receiverCode,
      invoice_description: params.description,
      amount: params.amount,
      callback_url: params.callbackUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}

export async function checkPayment(invoiceId: string): Promise<boolean> {
  const token = await getQPayToken();

  const res = await fetch(
    `${QPAY_BASE_URL}/payment/check?object_type=INVOICE&object_id=${invoiceId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) return false;
  const data = await res.json();
  return data.count > 0;
}
