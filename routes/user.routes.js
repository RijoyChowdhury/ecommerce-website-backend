import { Router } from "express";
import {
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
} from '../controllers/user.controllers.js';
import { auth, verifyAccess } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import { UserRoles } from "../models/user.model.js";

const router = Router();

router.post('/register', registerUserController);
router.post('/verify-email', verifyEmailController);

router.post('/login', loginController);
router.post('/admin-login', verifyAccess(UserRoles.ADMIN), loginController);
router.get('/logout', auth, logoutController);

router.post('/update', auth, updateUserDetailsController);
router.get('/details', auth, userDetailsController);

router.post('/forgot-password', forgotPasswordController);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
router.post('/reset-password', resetPasswordController);

router.post('/resend-otp', resendOtpController);
router.post('/refresh-token', refreshTokenController);

router.put('/upload-avatar', auth, upload.single('avatar'), userAvatarUploadController);
router.delete('/delete-avatar', auth, removeImageFromCloudinaryController);

export default router;