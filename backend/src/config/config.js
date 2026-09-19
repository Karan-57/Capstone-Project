const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if(!process.env.MONGO_URI) {
    console.error("Missing required mongo uri variables");
    process.exit(1);
}

if(!process.env.JWT_SECRET) {
    console.error("Missing required jwt secret variables");
    process.exit(1);
}

if(!process.env.GOOGLE_CLIENT_ID){
    console.error("Missing required google client id variables");
    process.exit(1);        
}

if(!process.env.GOOGLE_CLIENT_SECRET){  
    console.error("Missing required google client secret variables");
    process.exit(1);
}   

if(!process.env.GOOGLE_REFRESH_TOKEN){
    console.error("Missing required google refresh token variables");
    process.exit(1);
}

if(!process.env.GOOGLE_USER){
    console.error("Missing required google user variables");
    process.exit(1);
}

const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET ,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER: process.env.GOOGLE_USER,
    PORT: process.env.PORT || 3000
};

module.exports = config;