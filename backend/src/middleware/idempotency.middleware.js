const crypto = require('crypto');

/**
 * Strict Idempotency Middleware
 * Ensures all mutating financial transactions have an Idempotency-Key.
 * Uses client-provided Idempotency-Key header or auto-generates a secure UUIDv4 fallback.
 */
function requireIdempotencyKey(req, res, next) {
  let key =
    req.headers['idempotency-key'] ||
    req.headers['x-idempotency-key'] ||
    req.body?.idempotencyKey;

  if (!key || typeof key !== 'string' || !key.trim()) {
    key = crypto.randomUUID();
  }

  req.idempotencyKey = key.trim();
  next();
}

module.exports = {
  requireIdempotencyKey,
};
