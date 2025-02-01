import { Router } from "express";
import {
    registerUserController, 
    verifyEmailController, 
    loginController, 
    logoutController,
    updateUserDetails,
    userAvatarUploadController,
    removeImageFromCloudinaryController,
} from '../controllers/user.controllers.js';
import { auth } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.post('/register',registerUserController);
router.post('/verify-email' ,verifyEmailController);
router.post('/login' ,loginController);
router.get('/logout', auth, logoutController);
router.put('/upload-avatar', auth, upload.array('avatar'), userAvatarUploadController);
router.delete('/delete-image', auth, removeImageFromCloudinaryController);
router.put('/:id', auth, updateUserDetails);
// router.put('/forgot-password', forgotPasswordController);
// router.put('/verify-forgot-password-otp' ,verifyForgotPasswordOtp);
// router.put('/reset-password',resetpassword);
// router.post('/refresh-token',refreshToken);
// router.get('/user-details',auth, userDetails);

export default router;