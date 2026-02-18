import { eq } from "drizzle-orm";

import type { InsertPassType, PassType } from "../schema";

import db from "..";
import { pass } from "../schema";

export async function getValidPassesByUserId(userId: number) {
  return db.query.pass.findMany({
    where: (pass, { and, eq, gt }) => and(
      eq(pass.userId, userId),
      gt(pass.expiresAt, Date.now()),
      gt(pass.creditsRemaining, 0),
      eq(pass.isDeleted, 0),
    ),
    orderBy: (pass, { asc }) => [asc(pass.expiresAt)],
  });
}

export async function findValidPass(passId: number, userId: number) {
  return db.query.pass.findFirst({
    where: (pass, { and, eq, gte, gt }) => and(
      eq(pass.id, passId),
      eq(pass.userId, userId),
      gte(pass.expiresAt, Date.now()),
      gt(pass.creditsRemaining, 0),
      eq(pass.isDeleted, 0),
    ),
  });
}

export async function findPassById(passId: number) {
  return db.query.pass.findFirst({
    where: (pass, { eq }) => eq(pass.id, passId),
  });
}

export async function updatePass(data: PassType, userId: number) {
  const updatedData = {
    ...data,
    updatedAt: Date.now(),
    updatedBy: Number(userId),
  };

  const [updated] = await db.update(pass).set(updatedData).where(eq(pass.id, data.id)).returning();
  return updated;
}

export async function getAllPassesWithUsers() {
  return db.query.pass.findMany({
    where: (pass, { eq }) => eq(pass.isDeleted, 0),
    orderBy: (pass, { asc }) => [asc(pass.createdAt)],
    with: {
      user: true,
    },
  });
}

export async function getAllPasses() {
  return db.query.pass.findMany({
    orderBy: (pass, { asc }) => [asc(pass.createdAt)],
  });
}

export async function insertPass(data: InsertPassType) {
  const passData = {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  } as Omit<PassType, "id">;

  const [inserted] = await db.insert(pass).values(passData).returning();
  return inserted;
}

export type PassTypeWithUser = PassType & { user: { name: string } };
