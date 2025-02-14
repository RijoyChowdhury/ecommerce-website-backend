import { Router } from "express";
import upload from "../middleware/multer.middleware.js";
import { auth } from "../middleware/auth.middleware.js";
import { uploadImages, deleteImage } from "../controllers/imageService.controllers.js";

const router = Router();

router.post('/upload', auth, upload.array('images'), uploadImages);
router.post('/upload-avatar', auth, upload.array('avatar'), uploadImages);
router.delete('/:id', auth, deleteImage);

export default router;