import { Router } from "express";
import userRouter from './user.routes.js';
import categoryRouter from './category.routes.js';
import productRouter from './product.routes.js';
import cartRouter from './cart.routes.js';
import wishlistRouter from './wishlist.routes.js';
import imageRouter from './image.routes.js';

const router = Router();

router.use('/user', userRouter);
router.use('/category', categoryRouter);
router.use('/product', productRouter);
router.use('/cart', cartRouter);
router.use('/wishlist', wishlistRouter);
router.use('/image', imageRouter);

export default router;