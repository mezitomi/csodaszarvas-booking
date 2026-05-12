import type { PaymentType } from "../schema";

import db from "..";
import { payment } from "../schema";

export async function createPayment(data: Omit<PaymentType, "id">) {
  const [created] = await db.insert(payment).values(data).returning();
  return created;
}

export async function findPayment(bookingId: number) {
  return db.query.payment.findFirst({
    where: (payment, { eq }) => eq(payment.bookingId, bookingId),
  });
}
