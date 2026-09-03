const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const config = require('../config/config');

const OAuth2 = google.auth.OAuth2;

async function createTransporter() {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET || !config.GOOGLE_REFRESH_TOKEN || !config.GOOGLE_USER) {
        return null;
    }

    try {
        const oauth2Client = new OAuth2(
            config.GOOGLE_CLIENT_ID,
            config.GOOGLE_CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({
            refresh_token: config.GOOGLE_REFRESH_TOKEN
        });

        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: config.GOOGLE_USER,
                clientId: config.GOOGLE_CLIENT_ID,
                clientSecret: config.GOOGLE_CLIENT_SECRET,
                refreshToken: config.GOOGLE_REFRESH_TOKEN,
                accessToken: accessToken?.token || accessToken
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        return transporter;
    } catch (error) {
        console.error("Failed to create OAuth2 email transporter:", error.message);
        return null;
    }
}

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = await createTransporter();

        if (!transporter) {
            console.log(`\n========================================`);
            console.log(`[EMAIL SERVICE] Email credentials not configured or failed.`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${text}`);
            console.log(`========================================\n`);
            return;
        }

        const info = await transporter.sendMail({
            from: `"Authentication Service" <${config.GOOGLE_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("Message sent:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error.message);
    }
};

module.exports = { sendEmail };