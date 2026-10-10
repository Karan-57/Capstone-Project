/**
 * Security Middleware
 * Protects against:
 * - NoSQL query injection (stripping $ and . operator keys)
 * - Basic XSS script injections
 * - Standard web security headers
 */

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const key of Object.keys(obj)) {
    // Prevent NoSQL operator injection (e.g. $gt, $ne, $where)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    let val = obj[key];
    if (typeof val === 'string') {
      // Basic XSS sanitization for string payloads
      val = val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else if (typeof val === 'object' && val !== null) {
      val = sanitizeObject(val);
    }

    sanitized[key] = val;
  }
  return sanitized;
}

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

function preventNoSqlAndXss(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
}

module.exports = {
  securityHeaders,
  preventNoSqlAndXss,
  sanitizeObject,
};
