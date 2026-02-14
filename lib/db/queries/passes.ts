import { eq } from "drizzle-orm";

import type { PassType as SchemaPassType } from "../schema";

import db from "..";
import { pass } from "../schema";

export async function getValidPassesByUserId(userId: number) {
  return db.query.pass.findMany({
    where: (pass, { and, eq, gt }) => and(
      eq(pass.userId, userId),
      gt(pass.expiresAt, Date.now()),
      gt(pass.creditsRemaining, 0),
    ),
    orderBy: (pass, { asc }) => [asc(pass.expiresAt)],
  });
}

export async function getValidUserPasses(userId: number) {
  return db.query.pass.findMany({
    where: (pass, { and, eq, gt }) => and(
      eq(pass.userId, userId),
      gt(pass.expiresAt, Date.now()),
      gt(pass.creditsRemaining, 0),
    ),
    orderBy: (pass, { asc }) => [asc(pass.expiresAt)],
  });
}

export async function findPass(passId: number, userId: number) {
  return db.query.pass.findFirst({
    where: (pass, { and, eq, gte, gt }) => and(
      eq(pass.id, passId),
      eq(pass.userId, userId),
      gte(pass.expiresAt, Date.now()),
      gt(pass.creditsRemaining, 0),
    ),
  });
}

export async function updatePass(data: SchemaPassType, userId: number) {
  const updatedData = {
    ...data,
    updatedAt: Date.now(),
    updatedBy: Number(userId),
  };

  const [updated] = await db.update(pass).set(updatedData).where(eq(pass.id, data.id)).returning();
  return updated;
}
