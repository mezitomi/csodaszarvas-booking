import type { User } from "better-auth";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAuthMiddleware } from "better-auth/plugins";

import db from "./db/index";
import { sendEmailFireAndForget } from "./email";
import {
  buildExistingUserSignUpNoticeTemplate,
  buildResetPasswordEmailTemplate,
  buildVerifyEmailTemplate,
  getLocaleFromRequest,
} from "./email-templates";
import env from "./env";

export type UserWithId = Omit<User, "id"> & {
  id: number;
  role: "admin" | "user";
};

export const auth = betterAuth({
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: false,
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/get-session") {
        if (!ctx.context.session) {
          return ctx.json({
            session: null,
            user: null,
          });
        }
        return ctx.json(ctx.context.session);
      }
    }),
  },
  onAPIError: {
    onError: (error: unknown) => {
      console.warn("Auth API error", error);
    },
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"],
    },
    database: {
      generateId: false,
    },
  },
  rateLimit: {
    window: 60,
    max: 120,
    customRules: {
      "/get-session": false,
      "/sign-in/email": {
        window: 60,
        max: 8,
      },
      "/sign-up/email": {
        window: 60,
        max: 5,
      },
      "/request-password-reset": {
        window: 60,
        max: 5,
      },
      "/reset-password": {
        window: 60,
        max: 8,
      },
      "/sign-in/social": {
        window: 60,
        max: 12,
      },
      "/link-social": {
        window: 60,
        max: 6,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    customSyntheticUser: ({
      coreFields,
      additionalFields,
      id,
    }: {
      coreFields: Record<string, unknown>;
      additionalFields: Record<string, unknown>;
      id: string | number;
    }) => ({
      ...coreFields,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
    sendResetPassword: async ({ user, url }, request) => {
      const locale = getLocaleFromRequest(request);
      const template = buildResetPasswordEmailTemplate(locale, {
        userEmail: user.email,
        url,
      });

      sendEmailFireAndForget({
        to: user.email,
        subject: template.subject,
        text: template.text,
      });
    },
    onExistingUserSignUp: async ({ user }: { user: { email: string } }, request: Request) => {
      const locale = getLocaleFromRequest(request);
      const template = buildExistingUserSignUpNoticeTemplate(locale, user.email);

      sendEmailFireAndForget({
        to: user.email,
        subject: template.subject,
        text: template.text,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const locale = getLocaleFromRequest(request);
      const template = buildVerifyEmailTemplate(locale, {
        userEmail: user.email,
        url,
      });

      sendEmailFireAndForget({
        to: user.email,
        subject: template.subject,
        text: template.text,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: "select_account",
    },
  },
  plugins: [
    admin(),
  ],
});
