import createError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/index.js';
import sendEmail from '../utils/sendEmailService.js';
import { generateVerificationEmailTemplate } from '../utils/mailTemplateGenerator.js';
import { generateAccessToken, generateRefreshToken } from '../utils/authService.js';

const registerUserController = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            throw createError.NotFound('Name, email or password cannot be empty');
        }
        const user = await UserModel.findOne({ email });
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
        const { email, otp } = req.body;
        const user = await UserModel.findOne({ email });
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

const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw createError.NotFound('User not found');
        }
        if (user.status !== 'Active') {
            throw createError.NotFound('Contact Admin');
        }

        const isSamePassword = await bcrypt.compare(password, user.password);
        if (!isSamePassword) {
            throw createError.NotFound('Wrong credentials');
        }

        const access_token = await generateAccessToken(user._id);
        const refresh_token = await generateRefreshToken(user._id);

        user.last_login_date = new Date();
        const updateUser = await user.save();

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        };
        res.cookie('accessToken', access_token, cookieOption);
        res.cookie('refreshToken', refresh_token, cookieOption);

        res.status(200).json({
            success: true,
            error: false,
            message: 'Login successful',
            data: {
                access_token,
                refresh_token,
            }
        });
    } catch (err) {
        next(err);
    }
}

const logoutController = async (req, res, next) => {
    try {
        const userId = req.userId; // from middleware
        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        };
        res.clearCookie('accessToken', cookieOption);
        res.clearCookie('refreshToken', cookieOption);

        const updateUserRefreshToken = await UserModel.findByIdAndUpdate(userId, {
            refresh_token: '',
        });

        res.status(200).json({
            success: true,
            error: false,
            message: 'Logout Successful',
        });
    } catch (err) {
        next(err);
    }
}

export {
    registerUserController,
    verifyEmailController,
    loginController,
    logoutController,
};