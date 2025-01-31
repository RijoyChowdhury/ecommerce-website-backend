import createError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {UserModel} from '../models/index.js';
import sendEmail from '../utils/sendEmailService.js';
import { generateVerificationEmailTemplate } from '../utils/mailTemplateGenerator.js';

const registerUserController = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;
        if (!name || !email || !password) {
            throw createError.NotFound('Name, email or password cannot be empty');
        }
        const user = await UserModel.findOne({email});
        if (user) {
            throw createError.Conflict('Email already registered');
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const payload = {
            name,
            email,
            password: hashedPassword,
            otp: verificationCode,
            otp_expiry: Date.now() + 600000, // expires in 5 mins
        };
        const newUser = new UserModel(payload);
        await newUser.save();
        
        // const verifyEmail = await sendEmail({
        //     sendTo: email,
        //     subject: 'Verify email account',
        //     text: '',
        //     html: generateVerificationEmailTemplate(name, verificationCode),
        // });

        const token = jwt.sign({
            email,
            id: newUser._id,
        }, process.env.JSON_WEB_TOKEN_SECRET_KEY);
        
        res.status(200).json({
            success: true,
            error: false,
            message: 'User created.',
            token: token,
        });
    } catch (err) {
        next(err);
    }
};

const verifyEmailController = async (req, res, next) => {
    try {
        const {email, otp} = req.body;
        const user = await UserModel.findOne({email});
        if (!user) {
            throw createError.NotFound('User not found');
        }
        const isCodeValid = user.otp === otp;
        const isNotExpired = user.otp_expiry > Date.now();

        if (isCodeValid && isNotExpired) {
            user.isVerified = true;
            user.otp = null;
            user.otp_expiry = null;
            await user.save();

            res.status(200).json({
                success: true,
                error: false,
                message: 'Email verified',
            });
        } else if (!isCodeValid) {
            throw createError.Conflict('OTP not valid');
        } else {
            throw createError.Conflict('OTP expired');
        }        
    } catch (err) {
        next(err);
    }
}

export {
    registerUserController,
    verifyEmailController
};