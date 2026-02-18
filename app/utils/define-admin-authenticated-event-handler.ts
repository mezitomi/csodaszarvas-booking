import type { UserWithId } from "~~/lib/auth";
import type { H3Event, H3EventContext } from "h3";

type AuthenticatedEvent = H3Event & {
  context: H3EventContext & {
    user: UserWithId;
  };
};

export default function defineAdminAuthenticatedEventHandler<T>(
  handler: (event: AuthenticatedEvent) => T,
) {
  return defineEventHandler(async (event) => {
    if (!event.context.user || !(event.context.user as UserWithId).role.includes("admin")) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    return handler(event as AuthenticatedEvent);
  });
}
