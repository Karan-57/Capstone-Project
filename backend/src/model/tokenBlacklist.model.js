const mongoose = require('mongoose')

const tokenBlacklistSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is required to blacklist"],
        unique:[true,"token is already blacklisted"]
    },
    blacklistedAt:{
        type:Date,
        default:Date.now,
        immutable:true,
    }
},{
    timestamps:true
});

tokenBlacklistSchema.index({createdAt:1},{
    expireAfterSeconds:60 * 60 * 24 * 3
});

const tokenBlacklistModel = mongoose.model('blacklist',tokenBlacklistSchema);

module.exports = tokenBlacklistModel;    