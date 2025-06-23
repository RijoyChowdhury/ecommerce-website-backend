import { Router } from "express";
import upload from "../middleware/multer.middleware.js";
import { auth } from "../middleware/auth.middleware.js";
import { 
    createProductController, 
    getAllProductsByCategoryController, 
    getAllProductsController, 
    deleteProductController,
    getProductDetailsController,
    updateProductDetailsController,
} from "../controllers/product.controllers.js";

const router = Router();

router.get('/getAllProducts', getAllProductsController);
router.get('/getAll/:id', getAllProductsByCategoryController);

router.post('/create', auth, createProductController);
router.get('/:id', auth, getProductDetailsController);
router.post('/:id', auth, updateProductDetailsController);
router.delete('/:id', auth, deleteProductController);

export default router;