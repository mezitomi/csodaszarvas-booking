type BetterAuthError = {
  code?: string;
  message?: string;
  status?: number;
};

const VERIFY_STATUS_CODE = 403;
const RATE_LIMIT_STATUS_CODE = 429;

type TranslateFn = (key: string) => string;

const codeToI18nKey: Record<string, string> = {
  "invalid_email_or_password": "errors.auth.invalid_email_or_password",
  "invalid_password": "errors.auth.invalid_email_or_password",
  "invalid_email": "errors.auth.invalid_email",
  "invalid_token": "errors.auth.invalid_token",
  "token_expired": "errors.auth.invalid_token",
  "user_not_found": "errors.auth.generic",
  "email_not_found": "errors.auth.generic",
  "user_already_exists": "errors.auth.user_already_exists",
  "signup_disabled": "errors.auth.signup_disabled",
  "account_not_linked": "errors.auth.account_not_linked",
  "account_already_linked_to_different_user": "errors.auth.account_already_linked",
  "email_doesn't_match": "errors.auth.email_does_not_match",
  "unable_to_link_account": "errors.auth.unable_to_link_account",
};

const verificationErrorCodes = new Set([
  "email_not_verified",
  "email_verification_required",
]);

function isCsrfError(error: BetterAuthError | null | undefined) {
  if (!error)
    return false;

  const code = error.code?.toLowerCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";

  return code.includes("csrf") || message.includes("csrf");
}

export function mapAuthErrorMessage(error: BetterAuthError | null | undefined, t: TranslateFn) {
  if (!error)
    return "";

  const code = error.code?.toLowerCase();
  const mappedKey = code ? codeToI18nKey[code] : undefined;

  if (mappedKey)
    return t(mappedKey);

  if (error.status === RATE_LIMIT_STATUS_CODE)
    return t("errors.auth.rate_limited");

  if (requiresEmailVerification(error))
    return t("errors.auth.email_verification_required");

  if (isCsrfError(error))
    return t("errors.auth.generic");

  return t("errors.auth.generic");
}

export function requiresEmailVerification(error: BetterAuthError | null | undefined) {
  if (!error || error.status !== VERIFY_STATUS_CODE || isCsrfError(error))
    return false;

  const code = error.code?.toLowerCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";

  if (verificationErrorCodes.has(code))
    return true;

  return message.includes("verify") && message.includes("email");
}
