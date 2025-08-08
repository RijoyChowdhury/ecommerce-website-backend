import { Router } from "express";
import { 
    addItemToCartController, 
    getCartItemsController, 
    updateCartItemQuantityController,
    deleteCartItemController,
    checkoutController,
    getCheckoutDetailsController,
} from "../controllers/cart.controllers.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/checkout', auth, checkoutController);
router.get('/getCheckoutDetails/:id', auth, getCheckoutDetailsController);
router.post('/addToCart', auth, addItemToCartController);
router.put('/updateItem', auth, updateCartItemQuantityController);
router.get('/', auth, getCartItemsController);
router.delete('/:id', auth, deleteCartItemController);

export default router;