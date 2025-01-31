import { Router } from "express";
import {registerUserController} from '../controllers/user.controllers.js';

const router = Router();

router.post('/register',registerUserController);

export default router;