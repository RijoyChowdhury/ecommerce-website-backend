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
    refreshTokenController,
    userDetailsController,
    userAvatarUploadController,
    removeImageFromCloudinaryController,
} from '../controllers/user.controllers.js';
import { auth } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.post('/register', registerUserController);
router.post('/verify-email', verifyEmailController);

router.post('/login', loginController);
router.get('/logout', auth, logoutController);

router.put('/update', auth, updateUserDetailsController);
router.get('/details', auth, userDetailsController);

router.post('/forgot-password', forgotPasswordController);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
router.post('/reset-password', resetPasswordController);

router.post('/refresh-token', refreshTokenController);

router.put('/upload-avatar', auth, upload.array('avatar'), userAvatarUploadController);
router.delete('/delete-avatar', auth, removeImageFromCloudinaryController);

export default router;