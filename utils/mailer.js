import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587, // default 587 (465 if secure:true)
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to, code) => {
  await transporter.sendMail({
    from: `'Testing send email' <${process.env.SMTP_USER}`,
    to,
    subject: `Email Verification Code`,
    html: `<p>Your verification code is:<strong>${code}</strong></p>`,
  });
};
