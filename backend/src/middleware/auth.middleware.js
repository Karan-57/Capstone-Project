const jwt = require('jsonwebtoken')


const userModel = require('../model/user.model')
const tokenBlacklistModel = require('../model/tokenBlacklist.model')

async function authMiddleware(req, res, next) {
    const accessToken = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!accessToken) {
        return res.status(401).json({
            message: "unauthorized user, access token missing"
        });
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({token});

    if(isBlacklisted){
        return res.status(401).json({
            message:"unauthorized user, access token is invalid"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.user_id);

        req.user = user;

        return next();
    } catch (err) {
        res.status(401).json({
            message: "unauthorized user, token is invalid"
        });
    }
}



module.exports = {authMiddleware};