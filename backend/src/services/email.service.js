const nodemailer = require("nodemailer");
const dns = require("dns");
const config = require("../config/config");

// Ensure Node.js prioritizes IPv4 over IPv6 globally on cloud container environments like Render
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

// Custom lookup function strictly resolving IPv4 to prevent ENETUNREACH on Render/Docker
const ipv4Lookup = (hostname, options, callback) => {
    const cb = typeof options === "function" ? options : callback;
    return dns.lookup(hostname, { family: 4, all: false }, cb);
};

// Base SMTP configuration forcing IPv4 to prevent ENETUNREACH delays on cloud hosts like Render
const smtpOptions = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4,
    lookup: ipv4Lookup,
    connectionTimeout: 10000,
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
