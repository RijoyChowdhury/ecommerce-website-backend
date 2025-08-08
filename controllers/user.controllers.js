import createError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { UserModel } from '../models/index.js';
import sendEmail from '../utils/sendEmailService.js';
import { generateVerificationEmailTemplate } from '../utils/mailTemplateGenerator.js';
import { generateAccessToken, generateRefreshToken } from '../utils/authService.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true,
});

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const encryptData = async (data) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, salt);
};

const registerUserController = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, userPrefix = 'single' } = req.body;
        if (!firstName || !lastName || !email || !password) {
            throw createError.BadRequest('First name, last name, email or password cannot be empty');
        }
        const user = await UserModel.findOne({ email });
        if (user) {
            throw createError.BadRequest('Email already registered');
        }

        const verificationCode = generateVerificationCode();
        const hashedPassword = await encryptData(password);

        const payload = {
            userPrefix,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            otp: verificationCode,
            otp_expiry: Date.now() + 10 * 60 * 1000, // expires in 10 mins
        };

        const newUser = new UserModel(payload);
        await newUser.save();

        // const verifyEmail = await sendEmail({
        //     sendTo: email,
        //     subject: 'Verify email account',
        //     text: '',
        //     html: generateVerificationEmailTemplate(`${firstName} ${lastName}`, verificationCode),
        // });

        res.status(200).json({
            success: true,
            error: false,
            message: 'User created.',
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
            throw createError.BadRequest('OTP not valid');
        } else {
            throw createError.BadRequest('OTP expired');
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
            throw createError.NotFound('Account not active');
        }

        const isSamePassword = await bcrypt.compare(password, user.password);
        if (!isSamePassword) {
            throw createError.NotFound('Wrong credentials');
        }

        const access_token = await generateAccessToken(user._id, user.role);
        const refresh_token = await generateRefreshToken(user._id, user.role);

        user.last_login_date = new Date();
        await user.save();

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
        });
    } catch (err) {
        next(err);
    }
}

const logoutController = async (req, res, next) => {
    try {
        const userId = req.userId; // from auth middleware
        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        };
        res.clearCookie('accessToken', cookieOption);
        res.clearCookie('refreshToken', cookieOption);

        await UserModel.findByIdAndUpdate(userId, {
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

const updateUserDetailsController = async (req, res, next) => {
    try {
        const userId = req.userId; // from auth middleware
        const { firstName, lastName, email, mobile, password } = req.body;
        const user = await UserModel.findById(userId);

        if (!user) {
            throw createError.NotFound('User not found');
        }

        let verifyCode = '';
        if (email && email !== user.email) {
            verifyCode = generateVerificationCode();
        }

        let hashedPassword = '';
        if (password) {
            hashedPassword = await encryptData(password);
        } else {
            hashedPassword = user.password;
        }

        await UserModel.findByIdAndUpdate(userId, {
            firstName,
            lastName,
            mobile,
            email,
            isVerified: email && email !== user.email ? false : true,
            password: hashedPassword,
            otp: verifyCode !== '' ? verifyCode : null,
            otp_expiry: verifyCode !== '' ? Date.now() + 10 * 60 * 1000 : '', // expires in 10 mins
        }, {
            new: true,
        });

        // send verification mail
        // if (email && email !== user.email) {
        //     const verifyEmail = await sendEmail({
        //         sendTo: email,
        //         subject: 'Verify email account',
        //         text: '',
        //         html: generateVerificationEmailTemplate(name, verificationCode),
        //     });
        // }

        res.status(200).json({
            success: true,
            error: false,
            message: 'User details update successful',
        });
    } catch (err) {
        next(err);
    }
}

const userDetailsController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await UserModel.findById(userId).select('-password -refresh_token -otp -otp_expiry');
        res.status(200).json({
            success: true,
            error: false,
            data: user,
            message: 'User details',
        });
    } catch (err) {
        next(err);
    }
}

const forgotPasswordController = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw createError.NotFound('User not found');
        }
        const otp = generateVerificationCode();
        const otp_expiry = Date.now() + 10 * 60 * 1000; // expires in 10 mins

        const updateUser = await UserModel.findByIdAndUpdate(user._id, {
            otp,
            otp_expiry,
        }, {
            new: true,
        });

        // send verification mail
        // if (email && email !== user.email) {
        //     const verifyEmail = await sendEmail({
        //         sendTo: email,
        //         subject: 'Verify email account',
        //         text: '',
        //         html: generateVerificationEmailTemplate(user.name, verificationCode),
        //     });
        // }

        res.status(200).json({
            success: true,
            error: false,
            message: 'OTP sent',
        });
    } catch (err) {
        next(err);
    }
}

const verifyForgotPasswordOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            throw createError.Conflict('Email/OTP cannot be empty');
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            throw createError.NotFound('User not found');
        }

        if (user.otp !== otp || user.otp_expiry < Date.now()) {
            throw createError.Forbidden('Invalid OTP');
        }

        user.otp = null;
        user.otp_expiry = '';
        await user.save();

        res.status(200).json({
            success: true,
            error: false,
            message: 'OTP verified',
        });
    } catch (err) {
        next(err);
    }
}

const resetPasswordController = async (req, res, next) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        if (!email || !newPassword || !confirmPassword) {
            throw createError.Conflict('Email/New Password/Confirm Password cannot be empty');
        }
        if (newPassword !== confirmPassword) {
            throw createError.Conflict('New Password and Confirm Password must match');
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            throw createError.NotFound('User not found');
        }

        const hashedPassword = await encryptData(newPassword);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            error: false,
            message: 'Password update successful',
        });
    } catch (err) {
        next(err);
    }
}

const resendOtpController = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw createError.Conflict('Email cannot be empty');
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            throw createError.NotFound('User not found');
        }

        const otp = generateVerificationCode();
        const otp_expiry = Date.now() + 10 * 60 * 1000; // expires in 10 mins

        const updateUser = await UserModel.findByIdAndUpdate(user._id, {
            otp,
            otp_expiry,
        }, {
            new: true,
        });

        if (!updateUser) {
            throw createError.InternalServerError('User update operation failed');
        }

        // send verification mail
        // if (email && email !== user.email) {
        //     const verifyEmail = await sendEmail({
        //         sendTo: email,
        //         subject: 'Verify email account',
        //         text: '',
        //         html: generateVerificationEmailTemplate(user.name, verificationCode),
        //     });
        // }

        res.status(200).json({
            success: true,
            error: false,
            message: 'OTP sent',
        });
    } catch (err) {
        next(err);
    }
}

const refreshTokenController = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(' ')[1];
        if (!refreshToken) {
            throw createError.BadRequest('Invalid token');
        }

        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
        if (!verifyToken) {
            throw createError.BadRequest('Invalid token');
        }

        const userId = verifyToken.id;
        const newAccessToken = generateAccessToken(userId);
        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        };

        res.cookie('accessToken', newAccessToken, cookieOption);

        res.status(200).json({
            success: true,
            error: false,
            message: 'Access token generated',
        });
    } catch (err) {
        next(err);
    }
}

let imageArray = new Array();
const userAvatarUploadController = async (req, res, next) => {
    try {
        imageArray = new Array();
        const userId = req.userId; // from auth middleware
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        const user = await UserModel.findOne({ _id: userId });
        if (!user) {
            throw createError.NotFound('User not found');
        }

        for (let i = 0; i < req?.files?.length; i++) {
            const file = req.files[i];
            const img = await cloudinary.uploader.upload(
                file.path,
                options,
                (err, result) => {
                    imageArray.push(result.secure_url);
                    fs.unlinkSync(`uploads/${file.filename}`); // delete the files after upload
                }
            );
        }

        user.avatar = imageArray[0];
        await user.save();

        res.status(200).json({
            _id: userId,
            avatarUrl: imageArray[0],
        });
    } catch (err) {
        next(err);
    }
}

const removeImageFromCloudinaryController = async (req, res, next) => {
    try {
        // example path: '/api/user/delete-image?img=?img1.jpg'
        const imgUrl = req.query.img;
        const urlArr = imgUrl.split('/');
        const image = urlArr[urlArr.length - 1];
        const imgName = image.split('.')[0];
        const userId = req.userId; // from auth middleware

        const user = await UserModel.findOne({ _id: userId });
        if (!user) {
            throw createError.NotFound('User not found');
        }

        if (imgName) {
            const result = await cloudinary.uploader.destroy(imgName, (err, result) => {
                console.log(err);
            });

            if (result) {
                user.avatar = '';
                await user.save();

                res.status(200).json({
                    success: true,
                    error: false,
                    data: result,
                });
            }
        }
        throw createError.NotFound('Image filename not present');
    } catch (err) {
        next(err);
    }
}

export {
    registerUserController,
    verifyEmailController,
    loginController,
    logoutController,
    updateUserDetailsController,
    forgotPasswordController,
    verifyForgotPasswordOtp,
    resetPasswordController,
    resendOtpController,
    refreshTokenController,
    userDetailsController,
    userAvatarUploadController,
    removeImageFromCloudinaryController,
};