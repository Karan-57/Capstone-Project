const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
    
const userModel = require('../models/user.model')
const config = require('../config/config')
const otpModel = require('../model/otp.model')
const sessionModel = require('../model/session.model')
const {sendEmail} = require('../services/email.sevice.js');
// const blacklistModel = require('../models/blacklist.model')


/**
 * @name registerUserController
 * @description register new user, expect username, email and password
 * @access Public
 */

async function registerUserController(req,res){
    const {username, email, password} = req.body;
    
    if(!username || !email || !password){
        return res.status(400).json({
            message: "username, email and password are required"
        });
    }

    const alreadyExists = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    });

    if(alreadyExists){
        res.status(409).json({
            message:"username or email already exists"
        });
    }

    const hashedPassword = bcrypt.hash(password,10);

    const user = await userModel.create({
        username,
        email,
        password:hashedPassword
    });

    const otp = generateOTP();
    const html = generateOTPEmailHTML(otp);

    const otpHash = bcrypt.hash(otp, 10);

    await otpModel.create({
        email,
        user: user._id,
        otpHash
    })
    
    await sendEmail(email,"Otp verification",`Your otp is ${otp}`,html);
    
    
    
    res.status(201).json({
        message:"user registered successfully",
        user:{
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    });
}


/**
 * @name loginUserController
 * @description login a user, expect email and password
 * @access Public
 */

async function loginUserController(req,res){
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            message:"email and password is required"
        });
    }

    const user = await userModel.findOne({email});

    if(!user){
        return res.status(401).json({
            message:"Incorrect email or password"
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return  res.status(401).json({
            message:"Incorrect email or password"
        });
    }

    const token = jwt.sign({
        id:user._id,
        username:user.username
    },process.env.JWT_SECRET,{
        expiresIn:"1d"
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        message:"user logged in",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    });
}


/**
 * @name logoutUserController
 * @description logout a user and then add token to blacklist
 * @access Public
 */
async function logoutUser(req, res){ 
    
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(400).json({message:"refresh token not found"});
    }

    const refreshTokenHash = await bcrypt.hash(refreshToken,10);

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked:false
    });

    if(!session){
        return res.status(400).json({
            message:"Invalid refresh token"
        });
    }

    session.revoked = true;
    await session.save();

    res.clearCookie('refreshToken');
    
    res.status(200).json({
        message:"user logged out successfully"
    });
}

/**
 * @name getMeController
 * @description to get current user info
 * @access Public
 */
async function getMeController(req,res){
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        message:"user details fetched sucessfully",
        user:{
            id:user._id,
            email:user.email,
            username: user.username
        }
    });
}

/**
 * @name verifyEmailController
 * @description to get current user info
 * @access Public
 */

//incomplete function
async function verifyEmailController(req,res){
    const {otp, email} = req.body;

    if(!otp || !email){
        return res.status(400).json({
            message:"otp and email is required"
        });
    }

    const otpHash = await bcrypt.hash(otp,10);

    const otpDoc = await otpModel.findOne({
        email,
        otpHash
    });

    if(!otpDoc){
        return res.status(400).json({
            message:"invalid otp"
        });
    }

    const user = await userModel.findByIdAndUpdate(otpDoc.user,{verified:true});

    await otpModel.deleteMany({email, otpHash});

    res.status(200).json({message:"user verified successfully"});
}

/**
 * @name refreshToken
 * @description to refresh access token using refresh token
 * @access Public
 */

async function refreshToken(req,res){
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({message:"refresh token not found"});
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET); 

    const refreshTokenHash = await bcrypt.hash(refreshToken,10);

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked:false
    });

    if(!session){
        return res.status(401).json({
            message:"invalid refresh Token"
        });
    }

    const accessToken = jwt.sign({
        id:decoded.id,
        session:session._id
    },
    config.JWT_SECRET,{
        expiresIn:'15m'
    });

    const newRefreshToken = jwt.sign({
        id:decoded.id,
    },config.JWT_SECRET,{
        expiresIn:'7d'
    });

    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken,10);

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie('refreshToken',newRefreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge:7*24*60*60*1000
    });

    res.status(200).json({
        message:"access token refershed",
        accessToken
    });
}

module.exports = {registerUserController, loginUserController, logoutUserController, getMeController, verifyEmailController}