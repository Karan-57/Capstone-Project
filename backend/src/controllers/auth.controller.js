const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
    
const userModel = require('../models/user.model')
// const blacklistModel = require('../models/blacklist.model')


/**
 * @name registerUserController
 * @description register new user, expect username, email and password
 * @access Public
 */

async function registerUserController(req,res){
    const {email, username, password} = req.body;
    
    if(!email || !username || !password){
        return res.status(400).json({
            message:"username, email & password is required"
        });
    }

    const userAlreadyExists = await userModel.findOne({
        $or:[
            {email},
            {username}
        ]
    });

    if(userAlreadyExists){
        return res.status(400).json({
            message:"user with this email and password already exists"
        });
    }

    const passwordHash = await bcrypt.hash(password,10);

    const user = await userModel.create({
        email,
        username,
        password:passwordHash
    });

    const token = jwt.sign({id:user._id, username:user.username},process.env.JWT_SECRET,{expiresIn:"1d"});

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
        message:"user registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
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
async function logoutUserController(req,res){
    const token = req.cookies.token;

    if(!token){
        return res.status(400).json({
            message:"token not found"
        });
    }

    // await blacklistModel.create({token});

    res.clearCookie("token");

    res.status(200).json({
        message:"user logged out"
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
export async function verifyEmailController(req,res){
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

module.exports = {registerUserController, loginUserController, logoutUserController, getMeController, verifyEmailController}