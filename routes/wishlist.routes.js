import { Router } from "express";
import { 
    addItemToWishlistController, 
    getWishlistItemsController,
    deleteWishlistItemController,
} from "../controllers/wishlist.controllers.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/addToWishlist', auth, addItemToWishlistController);
router.get('/', auth, getWishlistItemsController);
router.delete('/:id', auth, deleteWishlistItemController);

export default router;