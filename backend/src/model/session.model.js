const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true,"user is required"]
    },
    refreshTokenHash:{
        type:String,
        required:[true,"refresh token hash is required"]
    },
    ip:{
        type:String,
        required:[true,"ip is required"]
    },
    userAgent:{
        type:String,
        required:[true,"user agent is required"]
    },
    revoked:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

sessionSchema.index({ refreshTokenHash: 1 });
sessionSchema.index({ user: 1 });
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const sessionModel = mongoose.model('session', sessionSchema);

module.exports = sessionModel;