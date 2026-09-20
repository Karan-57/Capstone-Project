const multer = require('multer');

// Store file in memory as Buffer for direct upload to ImageKit
const storage = multer.memoryStorage();

// Strict allowed image MIME types (no icons, svgs, or gifs)
const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

// File filter: accept only standard image types
const fileFilter = (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and WebP image files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max
    }
});

module.exports = upload;
