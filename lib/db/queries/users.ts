import db from "..";

export async function getAllUsers() {
  return db.query.user.findMany({
    orderBy: (user, { asc }) => [asc(user.createdAt)],
  });
}
