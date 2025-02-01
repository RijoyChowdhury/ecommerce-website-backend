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
router.put('/upload-avatar', auth, upload.array('avatar'), userAvatarUploadController);
router.delete('/delete-image', auth, removeImageFromCloudinaryController);
router.put('/update-details', auth, updateUserDetailsController);
router.post('/forgot-password', forgotPasswordController);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
router.post('/reset-password', resetPasswordController);
router.post('/refresh-token', refreshTokenController);
router.get('/user-details', auth, userDetailsController);

export default router;