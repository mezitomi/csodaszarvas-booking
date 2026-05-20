import nodemailer from "nodemailer";

import env from "./env";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

const hasSmtpUser = env.SMTP_USER.trim().length > 0;
const hasSmtpPass = env.SMTP_PASS.trim().length > 0;

if (hasSmtpUser !== hasSmtpPass) {
  throw new Error("SMTP_USER and SMTP_PASS must either both be set or both be empty");
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  ...(hasSmtpUser && hasSmtpPass
    ? {
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      }
    : {}),
});

export async function sendEmail({ to, subject, text }: SendEmailInput) {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text,
  });
}

export function sendEmailFireAndForget(input: SendEmailInput) {
  void sendEmail(input).catch((error) => {
    console.error("Failed to send email", error);
  });
}
