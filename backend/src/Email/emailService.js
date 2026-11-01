const { Resend } = require("resend");

// Inisialisasi Resend client
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[RESEND WARNING] RESEND_API_KEY is not defined in environment variables.");
    return null;
  }
  return new Resend(apiKey);
};

/**
 * Template HTML Email Verifikasi Akun Finora
 * Desain modern, profesional, dan responsive untuk semua email client (Gmail, Outlook, Apple Mail)
 */
const generateVerificationEmailHtml = ({ name, email, verificationLink }) => {
  const recipientName = name || email.split("@")[0];
  const appUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify your Finora account</title>
  <style>
    /* Reset & Base Styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      height: 100% !important;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }
    .button-hover:hover {
      background-color: #059669 !important;
    }
  </style>
</head>
<body style="background-color: #F8FAFC; margin: 0; padding: 40px 0;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 0 16px;">
        
        <!-- Main Email Container (Max Width 580px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);">
          
          <!-- Header Section -->
          <tr>
            <td style="padding: 36px 40px 24px 40px; border-bottom: 1px solid #F1F5F9; background: linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 44px; height: 44px; background-color: #10B981; border-radius: 12px; text-align: center; vertical-align: middle;">
                    <span style="font-size: 22px; line-height: 44px; color: #FFFFFF;">💼</span>
                  </td>
                  <td style="padding-left: 14px;">
                    <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #0F172A; display: block;">FINORA</span>
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #10B981; display: block; margin-top: 1px;">Personal Finance</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              
              <!-- Badge -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 100px; padding: 6px 14px;">
                    <span style="color: #047857; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;">🛡️ Email Verification</span>
                  </td>
                </tr>
              </table>

              <!-- Main Heading -->
              <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 14px 0; letter-spacing: -0.5px; line-height: 1.3;">
                Confirm your email address
              </h1>

              <!-- Greeting & Introduction -->
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px 0;">
                Hello <strong>${recipientName}</strong>,
              </p>
              
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 32px 0;">
                Thank you for joining <strong>Finora</strong>. To ensure the security of your financial data and activate your account, please verify your email address by clicking the button below:
              </p>

              <!-- Call to Action Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 36px auto; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}" target="_blank" class="button-hover" style="display: inline-block; background-color: #10B981; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35); text-align: center; mso-padding-alt: 0;">
                      <!--[if mso]><i style="letter-spacing: 36px; mso-font-width: -100%; mso-text-raise: 30pt">&nbsp;</i><![endif]-->
                      <span style="mso-text-raise: 15pt;">Verify Email Address &rarr;</span>
                      <!--[if mso]><i style="letter-spacing: 36px; mso-font-width: -100%">&nbsp;</i><![endif]-->
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Information Note -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748B;">
                      ⏳ <strong>Link validity:</strong> This link expires in <strong>24 hours</strong>. If you didn't create an account on Finora, you can safely disregard this email.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="font-size: 12px; line-height: 18px; color: #94A3B8; margin: 0 0 8px 0;">
                Having trouble clicking the button? Copy and paste the link below into your browser:
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 16px; word-break: break-all;">
                <a href="${verificationLink}" target="_blank" style="color: #10B981; text-decoration: underline;">
                  ${verificationLink}
                </a>
              </p>

            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 24px 40px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B; font-weight: 500;">
                Finora • Personal Finance Tracker
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8; line-height: 16px;">
                Designed to help you manage transactions, income, and expenses simply and securely.<br>
                &copy; 2026 Finora. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        
        <!-- Unsubscribe / Sender Info -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin-top: 16px;">
          <tr>
            <td align="center" style="font-size: 11px; color: #94A3B8; line-height: 16px;">
              This is an automated operational email sent to ${email} regarding your Finora account.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Kirim email verifikasi menggunakan Resend
 */
const sendVerificationEmail = async ({ to, name, verificationLink }) => {
  const resend = getResendClient();
  
  if (!resend) {
    throw new Error("Resend client is not initialized. Please set RESEND_API_KEY in backend/.env.");
  }

  // Pengirim: gunakan custom domain jika ada, atau onboarding@resend.dev untuk testing gratis
  const from = process.env.RESEND_FROM_EMAIL || "Finora <onboarding@resend.dev>";
  const html = generateVerificationEmailHtml({ name, email: to, verificationLink });

  const result = await resend.emails.send({
    from,
    to: [to],
    subject: "Verify your Finora account",
    html,
  });

  return result;
};

module.exports = {
  sendVerificationEmail,
  generateVerificationEmailHtml,
};
