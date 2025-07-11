import { Router } from "express";
import upload from "../middleware/multer.middleware.js";
import { auth } from "../middleware/auth.middleware.js";
import { 
    createProductController, 
    getAllProductsController, 
    deleteProductController,
    getProductDetailsController,
    updateProductDetailsController,
    getfeaturedProductsController,
} from "../controllers/product.controllers.js";

const router = Router();

router.get('/getAllProducts', getAllProductsController);
router.get('/getFeaturedProducts', getfeaturedProductsController);

router.post('/create', auth, createProductController);
router.get('/:id', getProductDetailsController);
router.post('/:id', auth, updateProductDetailsController);
router.delete('/:id', auth, deleteProductController);

export default router;