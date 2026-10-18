const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * 1. Auth Rate Limiter
 * Scope: Login and Signup (/register, /login, /google)
 * Rule: 5 failed attempts per 15 min per account on that IP (relaxed to 50 in dev/demo)
 * - skipSuccessfulRequests: true ensures successful logins (HTTP 2xx) never count against quota.
 * - keyGenerator: keys by IP + email/username so teammates on the same Wi-Fi don't share limits.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 50,
  skipSuccessfulRequests: true, // Only count failed attempts (wrong password, errors)
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const identifier = (req.body?.email || req.body?.identifier || req.body?.username || '').toLowerCase().trim();
    return identifier ? `${req.ip}_${identifier}` : req.ip;
  },
  message: {
    status: 429,
    message: 'Too many failed authentication attempts for this account from this network. Please try again after 15 minutes.',
  },
});

/**
 * 2. Forgot Password Rate Limiter
 * Scope: /api/auth/forgot-password
 * Rule: 3 requests per 15 min per email on that IP (relaxed to 30 in dev/demo)
 * - keyGenerator: keys by IP + target email so one teammate resetting their password doesn't lock out others.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 3 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body?.email || '').toLowerCase().trim();
    return email ? `${req.ip}_${email}` : req.ip;
  },
  message: {
    status: 429,
    message: 'Too many password reset requests for this email. Please try again after 15 minutes.',
  },
});

/**
 * 3. Resend OTP Rate Limiter
 * Scope: /api/auth/resend-otp
 * Rule: 3 requests per 15 min per email on that IP (relaxed to 30 in dev/demo)
 * - keyGenerator: keys by IP + target email so teammates on the same Wi-Fi each get their own 3 resends.
 */
const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 3 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body?.email || req.query?.email || req.user?.email || '').toLowerCase().trim();
    return email ? `${req.ip}_${email}` : req.ip;
  },
  message: {
    status: 429,
    message: 'Too many OTP resend requests for this email. Please try again after 15 minutes.',
  },
});

module.exports = {
  authLimiter,
  forgotPasswordLimiter,
  resendOtpLimiter,
};
