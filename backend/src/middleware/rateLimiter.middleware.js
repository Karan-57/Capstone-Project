const rateLimit = require('express-rate-limit');

/**
 * 1. Auth Rate Limiter
 * Scope: Login and Signup (/register, /login, /google)
 * Rule: 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable older X-RateLimit-* headers
  message: {
    status: 429,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * 2. Forgot Password Rate Limiter
 * Scope: /api/auth/forgot-password
 * Rule: 3 requests per 15 minutes per IP
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many password reset requests from this IP. Please try again after 15 minutes.',
  },
});

/**
 * 3. Resend OTP Rate Limiter
 * Scope: /api/auth/resend-otp
 * Rule: 3 requests per 15 minutes per IP
 */
const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many OTP resend requests from this IP. Please try again after 15 minutes.',
  },
});

module.exports = {
  authLimiter,
  forgotPasswordLimiter,
  resendOtpLimiter,
};
