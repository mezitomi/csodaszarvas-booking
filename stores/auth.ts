import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/vue";
import { defineStore } from "pinia";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
  ],
});

export const useAuthStore = defineStore("useAuthStore", () => {
  const { locale } = useI18n();

  const session = authClient.useSession();
  const user = computed(() => session.value.data?.user);
  const loading = computed(() => session.value.isPending || session.value.isRefetching);

  function createCsrfHeaders() {
    const { csrf } = useCsrf();
    const token = typeof csrf === "string" ? csrf : csrf?.value;
    const headers = new Headers();

    headers.append("accept-language", locale.value === "hu" ? "hu-HU" : "en-US");

    if (token)
      headers.append("csrf-token", token);

    return headers;
  }

  async function googleSignIn() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });
  }

  async function linkGoogle(callbackURL = "/profile", errorCallbackURL = "/profile") {
    return authClient.linkSocial({
      provider: "google",
      callbackURL,
      errorCallbackURL,
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });
  }

  async function signUpWithEmail(payload: { name: string; email: string; password: string }, callbackURL: string) {
    return authClient.signUp.email({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      callbackURL,
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });
  }

  async function signInWithEmail(payload: { email: string; password: string; rememberMe?: boolean }) {
    return authClient.signIn.email({
      email: payload.email,
      password: payload.password,
      rememberMe: payload.rememberMe,
      callbackURL: "/",
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });
  }

  async function requestPasswordReset(email: string, redirectTo?: string) {
    return authClient.requestPasswordReset({
      email,
      redirectTo,
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });
  }

  async function resetPassword(token: string, newPassword: string) {
    return authClient.resetPassword({
      token,
      newPassword,
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });
  }

  async function sendVerificationEmail(email: string, callbackURL: string) {
    return authClient.sendVerificationEmail({
      email,
      callbackURL,
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });
  }

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });
    navigateTo("/");
  }

  return {
    loading,
    googleSignIn,
    linkGoogle,
    signUpWithEmail,
    signInWithEmail,
    requestPasswordReset,
    resetPassword,
    sendVerificationEmail,
    user,
    signOut,
  };
});
