const dotenv = require('dotenv');

dotenv.config();

const config = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/capstone',
    JWT_SECRET: process.env.JWT_SECRET || 'capstone_jwt_secret_key_default',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || '',
    GOOGLE_USER: process.env.GOOGLE_USER || '',
    PORT: process.env.PORT || 3000
};

module.exports = config;