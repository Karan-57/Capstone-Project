
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateOTPEmailHTML( otp) {
    return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #e5e5e5; border-radius:8px;">

        <h2 style="color:#333;">Hello,</h2>

        <p>Your One-Time Password (OTP) for verification is:</p>

        <div style="
            font-size:32px;
            font-weight:bold;
            letter-spacing:8px;
            text-align:center;
            padding:20px;
            margin:25px 0;
            background:#f4f4f4;
            border-radius:8px;
        ">
            ${otp}
        </div>

        <p>This OTP is valid for <strong>10 minutes</strong>.</p>

        <p>If you did not request this OTP, you can safely ignore this email.</p>

        <br/>

        <p>Thank you,</p>
        <p><strong>Authentication Service</strong></p>

    </div>
    `;
}

module.exports = {generateOTP, generateOTPEmailHTML}