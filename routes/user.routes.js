import { Router } from "express";
import {registerUserController, verifyEmailController} from '../controllers/user.controllers.js';

const router = Router();

router.post('/register',registerUserController);
router.post('/verify-email' ,verifyEmailController);
// router.post('/login' ,loginController);
// router.get('/logout', auth, logoutController);
// router.put('/upload-avatar', auth, upload. single('avatar'),uploadAvatar);
// router.put('/update-user', auth, updateUserDetails);
// router.put('/forgot-password', forgotPasswordController);
// router.put('/verify-forgot-password-otp' ,verifyForgotPasswordOtp);
// router.put('/reset-password',resetpassword);
// router.post('/refresh-token',refreshToken);
// router.get('/user-details',auth, userDetails);

export default router;