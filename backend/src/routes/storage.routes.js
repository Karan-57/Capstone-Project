const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { getAuthenticationParameters } = require('../services/imagekit.service');
const { parseMediaLink } = require('../utils/linkParser.util');

const storageRouter = Router();

// Protect storage routes with authentication
storageRouter.use(authMiddleware);

/**
 * @name getImageKitAuthParams
 * @description Generates client-side authentication parameters (signature, token, expire)
 * for direct frontend upload to ImageKit with zero server memory footprint.
 * @route GET /api/storage/imagekit-auth
 * @access Private
 */
storageRouter.get('/imagekit-auth', (req, res) => {
  try {
    const authParams = getAuthenticationParameters();
    return res.status(200).json({
      success: true,
      ...authParams,
    });
  } catch (err) {
    console.error('Error generating ImageKit auth parameters:', err.message);
    return res.status(500).json({
      message: 'Failed to generate ImageKit authentication parameters',
      error: err.message,
    });
  }
});

/**
 * @name parseLinkPreview
 * @description Preview helper: receives an external link and returns provider, fileId, and auto-generated thumbnail
 * @route POST /api/storage/parse-link
 * @access Private
 */
storageRouter.post('/parse-link', (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'URL is required' });
    }

    const parsed = parseMediaLink(url);
    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (err) {
    console.error('Error parsing link preview:', err.message);
    return res.status(500).json({
      message: 'Failed to parse link preview',
      error: err.message,
    });
  }
});

module.exports = storageRouter;
