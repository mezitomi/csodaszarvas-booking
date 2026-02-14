import type { UserWithId } from "./auth";

declare module "h3" {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface H3EventContext {
    user?: UserWithId;
  }
}

export type ServerResponse<T> = {
  data?: T;
  error: string | null;
};
