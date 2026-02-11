import { authClient } from "~~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, _) => {
  const localePath = useLocalePath();

  const { data: session } = await authClient.useSession(useFetch);
  if ((to.path.startsWith("/foglalas") || to.path.startsWith("/en/booking")) && !session?.value?.user) {
    return navigateTo(localePath("login"));
  }
});
