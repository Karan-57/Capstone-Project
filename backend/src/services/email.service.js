const nodemailer = require("nodemailer");
const config = require("../config/config");

// Create Nodemailer transporter using Gmail OAuth2.
// Nodemailer uses the refresh token to obtain access tokens automatically.
const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        type: "OAuth2",
        user: config.GOOGLE_USER,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN,
    },
});

// Optional: verify the Gmail connection when the application starts
transporter.verify((error, success) => {
    if (error) {
        console.error("[EMAIL SERVICE] Gmail transporter verification failed:");
        console.error(error.message);
    } else {
        console.log("[EMAIL SERVICE] Gmail OAuth2 transporter is ready.");
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
