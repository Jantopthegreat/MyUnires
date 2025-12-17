import nodemailer from "nodemailer";

export async function sendActivationEmail(toEmail, activationLink) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || user;

  // Debug config (tanpa print password)
  console.log("[SMTP CONFIG]", {
    host,
    port,
    secure,
    user,
    passLength: pass ? pass.length : 0,
    from,
    to: toEmail,
  });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },

    // bikin log SMTP lebih detail di terminal
    logger: true,
    debug: true,
  });

  // Cek koneksi/auth dulu
  try {
    await transporter.verify();
    console.log("[SMTP] verify OK");
  } catch (err) {
    console.error("[SMTP] verify FAILED", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
      responseCode: err?.responseCode,
      command: err?.command,
    });
    throw err;
  }

  // Kirim email
  try {
    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject: "Aktivasi Akun MyUnires",
      text: `Aktivasi akun kamu dengan link berikut:\n${activationLink}\n\nLink ini memiliki masa berlaku.`,
      html: `
        <p>Aktivasi akun kamu dengan klik link berikut:</p>
        <p><a href="${activationLink}">${activationLink}</a></p>
        <p>Link ini memiliki masa berlaku.</p>
      `,
    });

    console.log("[SMTP] sendMail OK", {
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
      response: info?.response,
    });

    return info;
  } catch (err) {
    console.error("[SMTP] sendMail FAILED", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
      responseCode: err?.responseCode,
      command: err?.command,
    });
    throw err;
  }
}
