import { authClient } from "~~/stores/auth";

export default defineNuxtRouteMiddleware(async (_, __) => {
  const { data: session } = await authClient.useSession(useFetch);
  if (session.value?.user && session.value.user.role?.includes("admin")) {
    return;
  }

  return navigateTo("/403");
});
