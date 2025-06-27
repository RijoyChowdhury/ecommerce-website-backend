import { Router } from "express";
import upload from "../middleware/multer.middleware.js";
import { auth } from "../middleware/auth.middleware.js";
import { 
    createCategoryController, 
    getCategoryListController, 
    uploadCategoryImagesController, 
    getCategoryDetailsController,
    deleteCategoryController,
    updateCategoryController,
} from "../controllers/category.controllers.js";

const router = Router();

router.post('/upload', auth, upload.array('images'), uploadCategoryImagesController);

router.post('/create', auth, createCategoryController);
router.get('/:id', getCategoryDetailsController);
router.get('/', getCategoryListController);
router.delete('/:id', auth, deleteCategoryController);
router.post('/:id', auth, updateCategoryController);

export default router;