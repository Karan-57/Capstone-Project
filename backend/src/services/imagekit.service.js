const ImageKit = require('imagekit');
const config = require('../config/config');

let imagekitInstance = null;

/**
 * Initializes and returns singleton ImageKit SDK client
 * @returns {ImageKit|null}
 */
function getImageKitClient() {
  if (imagekitInstance) {
    return imagekitInstance;
  }

  if (
    !config.IMAGEKIT_PUBLIC_KEY ||
    !config.IMAGEKIT_PRIVATE_KEY ||
    !config.IMAGEKIT_URL_ENDPOINT
  ) {
    console.warn('[ImageKit Service] ImageKit credentials missing in config');
    return null;
  }

  imagekitInstance = new ImageKit({
    publicKey: config.IMAGEKIT_PUBLIC_KEY,
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
  });

  return imagekitInstance;
}

/**
 * Generates client authentication parameters for direct frontend uploads
 * Returns { token, expire, signature }
 */
function getAuthenticationParameters() {
  const client = getImageKitClient();
  if (!client) {
    throw new Error('ImageKit client is not configured');
  }

  return client.getAuthenticationParameters();
}

/**
 * Deletes a file from ImageKit Media Library to immediately reclaim free storage
 * @param {string} fileId 
 * @returns {Promise<boolean>}
 */
async function deleteImageKitFile(fileId) {
  if (!fileId) return false;

  const client = getImageKitClient();
  if (!client) return false;

  try {
    await client.deleteFile(fileId);
    console.log(`[ImageKit Service] Deleted file ${fileId} from storage`);
    return true;
  } catch (err) {
    console.error(`[ImageKit Service] Error deleting file ${fileId}:`, err.message);
    return false;
  }
}

/**
 * Uploads a file buffer or base64 to ImageKit
 * @param {Buffer|string} fileBuffer
 * @param {string} fileName
 * @param {string} folder
 * @returns {Promise<Object>}
 */
async function uploadToImageKit(fileBuffer, fileName, folder = '/Capstone-storage') {
  const client = getImageKitClient();
  if (!client) {
    throw new Error('ImageKit client is not configured');
  }

  return await client.upload({
    file: fileBuffer,
    fileName: fileName,
    folder: folder,
  });
}

module.exports = {
  getImageKitClient,
  getAuthenticationParameters,
  deleteImageKitFile,
  uploadToImageKit,
};
