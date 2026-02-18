import { authClient } from "~~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, _) => {
  const localePath = useLocalePath();
  const loginPath = localePath("login");

  const { data: session } = await authClient.useSession(useFetch);
  if (session.value?.user) {
    return;
  }

  if (!to.path.startsWith(loginPath)) {
    return navigateTo(loginPath);
  }
});
