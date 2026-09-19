const ImageKit = require('imagekit');
const config = require('../config/config');

const imagekit = new ImageKit({
    publicKey: config.IMAGEKIT_PUBLIC_KEY,
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT
});

/**
 * Upload file buffer directly to ImageKit
 * @param {Buffer} fileBuffer - Buffer from multer memoryStorage
 * @param {string} fileName - Destination filename
 * @param {string} folder - Target folder in ImageKit storage
 * @returns {Promise<Object>} ImageKit upload response object
 */
async function uploadToImageKit(fileBuffer, fileName, folder = '/Capstone-storage/profile-pictures') {
    const fileData = Buffer.isBuffer(fileBuffer)
        ? fileBuffer.toString('base64')
        : fileBuffer;

    return await imagekit.upload({
        file: fileData,
        fileName: fileName,
        folder: folder
    });
}

module.exports = {
    imagekit,
    uploadToImageKit
};
