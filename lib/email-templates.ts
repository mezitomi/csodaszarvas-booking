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
      subject: "Sikeres regisztráció – Csodaszarvas",
      text: [
        "Kedves Íjásztársunk!",
        "",
        "Köszönjük, hogy regisztráltál a Csodaszarvas oldalra! Már csak egyetlen lépés választ el attól, hogy a közösségünk aktív tagjává válj.",
        "Kérjük, kattints az alábbi linkre a fiókod megerősítéséhez:",
        "",
        data.url,
        "",
        "(Ha a fenti link nem kattintható, másold ki, és illeszd be a böngésződ címsorába.)",
        "Amennyiben nem te indítottad a regisztrációt, kérjük, hagyd figyelmen kívül ezt a levelet.",
        "",
        "Üdvözlettel,",
        "A Csodaszarvas csapata",
      ].join("\n"),
    };
  }

  return {
    subject: "Successful Registration – Csodaszarvas",
    text: [
      "Dear Archer,",
      "",
      "Thank you for registering on the Csodaszarvas site! You're just one step away from becoming an active member of our community.",
      "Please click the link below to verify your account:",
      "",
      data.url,
      "",
      "(If the above link is not clickable, please copy and paste it into your browser's address bar.)",
      "If you did not initiate this registration, please ignore this email.",
      "",
      "Best regards,",
      "The Csodaszarvas Team",
    ].join("\n"),
  };
}

export function buildResetPasswordEmailTemplate(locale: SupportedLocale, data: EmailTemplateData) {
  if (locale === "hu") {
    return {
      subject: "Jelszó visszaállítási kérelem – Csodaszarvas",
      text: [
        "Kedves Felhasználónk!",
        "",
        "Azért kapod ezt az üzenetet, mert jelszó-visszaállítási kérelem érkezett a Csodaszarvas fiókodhoz.",
        "Új jelszó megadásához kattints az alábbi linkre:",
        "",
        data.url,
        "",
        "Ha nem te kérted a jelszó visszaállítását, nincs további teendőd. A jelszavad biztonságban van, és nem fog megváltozni.",
        "",
        "Üdvözlettel,",
        "A Csodaszarvas csapata",
      ].join("\n"),
    };
  }

  return {
    subject: "Password Reset Request – Csodaszarvas",
    text: [
      "Dear User,",
      "",
      "You are receiving this email because we received a password reset request for your account on Csodaszarvas.",
      "To choose a new password, please click the link below:",
      "",
      data.url,
      "",
      "If you did not request a password reset, no further action is required. Your password will remain unchanged and secure.",
      "",
      "Best regards,",
      "The Csodaszarvas Team",
    ].join("\n"),
  };
}

export function buildExistingUserSignUpNoticeTemplate(locale: SupportedLocale, userEmail: string) {
  if (locale === "hu") {
    return {
      subject: "Regisztrációs kísérlet az email címeddel – Csodaszarvas",
      text: [
        "Kedves Íjásztársunk!",
        "",
        `Azért kapod ezt az értesítést, mert valaki (remélhetőleg te) újra regisztrálni próbált az íjászat.eu oldalon ezzel az e-mail címmel: ${userEmail}.`,
        "Mivel ezzel a címmel már rendelkezel aktív fiókkal, új regisztrációra nincs szükség.",
        "- Ha elfelejtetted a jelszavadat, indíts jelszó-visszaállítást.",
        "- Ha be szeretnél lépni, azt a főoldalon a bejelentkezés menüpontban teheted meg.",
        "",
        "Amennyiben nem te próbáltál regisztrálni, úgy biztonsági teendőd nincs, a fiókodhoz senki sem fért hozzá.",
        "",
        "Üdvözlettel,",
        "Az íjászat.eu csapata!",
      ].join("\n"),
    };
  }

  return {
    subject: "Sign-up attempt with your email – Csodaszarvas",
    text: [
      "Dear Archer,",
      "",
      `You are receiving this notification because someone (hopefully you) attempted to sign up on the Csodaszarvas site using this email address: ${userEmail}.`,
      "Since there is already an active account associated with this email, no new registration is necessary.",
      "- If you forgot your password, please initiate a password reset.",
      "- If you want to log in, you can do so from the login page on the homepage.",
      "",
      "If you did not attempt to sign up, there is no security concern, and your account remains secure.",
      "",
      "Best regards,",
      "The Csodaszarvas Team",
    ].join("\n"),
  };
}
