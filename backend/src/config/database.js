const mongoose = require('mongoose')
const config = require('./config.js')

async function connectDB() {
    try{
        await mongoose.connect(config.MONGO_URI);
        console.log("server connected to database");
    }catch(err){
        console.log("error connecting to database",err);
        process.exit(1);
    }
}

module.exports = connectDB;