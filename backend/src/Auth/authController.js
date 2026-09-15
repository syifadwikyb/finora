const { sendVerificationEmail } = require("../Email/emailService");

const sendVerification = async (req, res) => {
  try {
    const { email, name, verificationLink, idToken } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    let link = verificationLink;

    // Jika link belum disediakan tetapi client menyertakan idToken, minta Firebase REST API untuk membuat oobLink
    if (!link && idToken) {
      const apiKey = process.env.FIREBASE_WEB_API_KEY;
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      try {
        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requestType: "VERIFY_EMAIL",
              idToken: idToken,
              continueUrl: `${frontendUrl}/login?verified=true`,
            }),
          }
        );
        const data = await response.json();
        if (data && data.oobLink) {
          link = data.oobLink;
        }
      } catch (err) {
        console.error("Failed to generate Firebase verification link via REST:", err);
      }
    }

    // Fallback jika tidak ada link khusus
    if (!link) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      link = `${frontendUrl}/login?verified=true`;
    }

    const result = await sendVerificationEmail({
      to: email,
      name,
      verificationLink: link,
    });

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully via Resend",
      data: result,
    });
  } catch (error) {
    console.error("[AUTH CONTROLLER ERROR]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send verification email",
    });
  }
};

module.exports = {
  sendVerification,
};
