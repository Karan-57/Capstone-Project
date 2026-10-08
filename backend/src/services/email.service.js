const nodemailer = require("nodemailer");
const config = require("../config/config");

// Create Nodemailer transporter
// Uses Google App Password if provided, otherwise falls back to OAuth2
const transporter = nodemailer.createTransport(
    config.GOOGLE_APP_PASSWORD
        ? {
              service: "gmail",
              auth: {
                  user: config.GOOGLE_USER,
                  pass: config.GOOGLE_APP_PASSWORD,
              },
          }
        : {
              service: "gmail",
              auth: {
                  type: "OAuth2",
                  user: config.GOOGLE_USER,
                  clientId: config.GOOGLE_CLIENT_ID,
                  clientSecret: config.GOOGLE_CLIENT_SECRET,
                  refreshToken: config.GOOGLE_REFRESH_TOKEN,
              },
          }
);

// Verify the Gmail connection when the application starts
transporter.verify((error, success) => {
    if (error) {
        console.error("[EMAIL SERVICE] Gmail transporter verification failed:");
        console.error(error.message);
    } else {
        console.log("[EMAIL SERVICE] Gmail transporter is ready.");
    }
});

// Send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Collabo" <${config.GOOGLE_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("[EMAIL SERVICE] Message sent:", info.messageId);

        return info;
    } catch (error) {
        console.error("[EMAIL SERVICE] Failed to send email:");
        console.error(error.message);

        // Log useful debugging information without exposing secrets
        console.error("[EMAIL SERVICE] Recipient:", to);
        console.error("[EMAIL SERVICE] Subject:", subject);

        // IMPORTANT:
        // Re-throw the error so the controller knows that
        // email delivery failed.
        throw error;
    }
};

module.exports = {
    sendEmail,
};
