type SupportedLocale = "hu" | "en";

type EmailTemplateData = {
  userEmail: string;
  url: string;
};

function normalizeLocale(locale: string): SupportedLocale {
  return locale.toLowerCase().startsWith("hu") ? "hu" : "en";
}

export function getLocaleFromRequest(request?: Request): SupportedLocale {
  if (!request)
    return "en";

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const firstLanguage = acceptLanguage.split(",")[0]?.trim();

  if (!firstLanguage)
    return "en";

  return normalizeLocale(firstLanguage);
}

export function buildVerifyEmailTemplate(locale: SupportedLocale, data: EmailTemplateData) {
  if (locale === "hu") {
    return {
      subject: "Erősítsd meg az email címed",
      text: [
        `Szia!`,
        "",
        "Kérjük, erősítsd meg az email címed az alábbi linkre kattintva:",
        data.url,
        "",
        "Ha nem te kezdeményezted, nyugodtan figyelmen kívül hagyhatod ezt az emailt.",
      ].join("\n"),
    };
  }

  return {
    subject: "Verify your email address",
    text: [
      "Hi,",
      "",
      "Please verify your email address by clicking the link below:",
      data.url,
      "",
      "If you did not request this, you can safely ignore this email.",
    ].join("\n"),
  };
}

export function buildResetPasswordEmailTemplate(locale: SupportedLocale, data: EmailTemplateData) {
  if (locale === "hu") {
    return {
      subject: "Jelszó visszaállítás",
      text: [
        "Szia!",
        "",
        "Jelszavad visszaállításához kattints az alábbi linkre:",
        data.url,
        "",
        "Ha nem te kérted a jelszó-visszaállítást, ezt az emailt figyelmen kívül hagyhatod.",
      ].join("\n"),
    };
  }

  return {
    subject: "Reset your password",
    text: [
      "Hi,",
      "",
      "To reset your password, click the link below:",
      data.url,
      "",
      "If you did not request a password reset, you can ignore this email.",
    ].join("\n"),
  };
}

export function buildExistingUserSignUpNoticeTemplate(locale: SupportedLocale, userEmail: string) {
  if (locale === "hu") {
    return {
      subject: "Regisztrációs kísérlet az email címeddel",
      text: [
        "Szia!",
        "",
        `Valaki a ${userEmail} email címmel próbált fiókot létrehozni.`,
        "Ha te voltál, próbálj meg bejelentkezni vagy indíts jelszó-visszaállítást.",
        "Ha nem te voltál, nincs teendőd.",
      ].join("\n"),
    };
  }

  return {
    subject: "Sign-up attempt with your email",
    text: [
      "Hi,",
      "",
      `Someone attempted to sign up with ${userEmail}.`,
      "If this was you, try signing in or use the password reset flow.",
      "If not, no action is required.",
    ].join("\n"),
  };
}
