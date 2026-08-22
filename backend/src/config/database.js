import mongoose from 'mongoose'

import config from './config.js'

async function connectDB() {
    try{
        await mongoose.connect(config.MONGO_URI);
        console.log("server connected to database");
    }catch(err){
        console.log("error connecting to database",err);
        process.exit(1);
    }
}

export default connectDB;