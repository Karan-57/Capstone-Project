const dotenv = require('dotenv');

dotenv.config();

if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI not found in environment variables");
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET not found in environment variables");
}


const config = {
    MONGO_URI : process.env.MONGO_URI,
    JWT_SECRET : process.env.JWT_SECRET,
}

module.exports = config;