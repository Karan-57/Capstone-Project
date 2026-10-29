const nodemailer = require("nodemailer");
const config = require("../config/config");

// Base SMTP configuration forcing IPv4 (family: 4) to prevent ENETUNREACH delays on cloud hosts like Render
const smtpOptions = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4, // Crucial: Force IPv4 to prevent 120s timeout on Render/Docker IPv6
    connectionTimeout: 10000, // 10s connection timeout instead of 120s OS hang
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: config.GOOGLE_APP_PASSWORD
        ? {
              user: config.GOOGLE_USER,
              pass: config.GOOGLE_APP_PASSWORD,
          }
        : {
              type: "OAuth2",
              user: config.GOOGLE_USER,
              clientId: config.GOOGLE_CLIENT_ID,
              clientSecret: config.GOOGLE_CLIENT_SECRET,
              refreshToken: config.GOOGLE_REFRESH_TOKEN,
          },
};

const transporter = nodemailer.createTransport(smtpOptions);

// Non-blocking Gmail transporter verification on boot
if (config.GOOGLE_USER && (config.GOOGLE_APP_PASSWORD || config.GOOGLE_REFRESH_TOKEN)) {
    transporter.verify((error) => {
        if (error) {
            console.warn("[EMAIL SERVICE] Gmail transporter warning:", error.message);
        } else {
            console.log("[EMAIL SERVICE] Gmail transporter is ready (IPv4).");
        }
    });
}

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
        console.error("[EMAIL SERVICE] Failed to send email:", error.message);
        console.error("[EMAIL SERVICE] Recipient:", to);
        console.error("[EMAIL SERVICE] Subject:", subject);
        throw error;
    }
};

module.exports = {
    sendEmail,
};
