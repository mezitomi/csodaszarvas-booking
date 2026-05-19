import type { Page } from "@playwright/test";

type AuthMockOptions = {
  signInStatus?: number;
  signInBody?: Record<string, unknown>;
  signUpStatus?: number;
  signUpBody?: Record<string, unknown>;
  requestResetStatus?: number;
  requestResetBody?: Record<string, unknown>;
  resetPasswordStatus?: number;
  resetPasswordBody?: Record<string, unknown>;
  sendVerificationStatus?: number;
  sendVerificationBody?: Record<string, unknown>;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  };
}

export async function mockAuthEndpoints(page: Page, options: AuthMockOptions = {}) {
  await page.route("**/api/auth/sign-in/email", async (route) => {
    await route.fulfill(jsonResponse(
      options.signInStatus ?? 200,
      options.signInBody ?? { user: { id: 1, email: "test@example.com" } },
    ));
  });

  await page.route("**/api/auth/sign-up/email", async (route) => {
    await route.fulfill(jsonResponse(
      options.signUpStatus ?? 200,
      options.signUpBody ?? { user: { id: 2, email: "new@example.com" } },
    ));
  });

  await page.route("**/api/auth/request-password-reset", async (route) => {
    await route.fulfill(jsonResponse(
      options.requestResetStatus ?? 200,
      options.requestResetBody ?? { ok: true },
    ));
  });

  await page.route("**/api/auth/reset-password", async (route) => {
    await route.fulfill(jsonResponse(
      options.resetPasswordStatus ?? 200,
      options.resetPasswordBody ?? { ok: true },
    ));
  });

  await page.route("**/api/auth/send-verification-email", async (route) => {
    await route.fulfill(jsonResponse(
      options.sendVerificationStatus ?? 200,
      options.sendVerificationBody ?? { ok: true },
    ));
  });
}
