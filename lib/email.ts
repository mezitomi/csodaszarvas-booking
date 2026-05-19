import nodemailer from "nodemailer";

import env from "./env";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
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
