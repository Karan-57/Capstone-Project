const multer = require('multer');

// Store file in memory as Buffer for direct upload to ImageKit
const storage = multer.memoryStorage();

// File filter: accept only image types
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, WebP, etc.) are allowed'), false);
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
