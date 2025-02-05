import createError from 'http-errors';
import CartProductModel from '../models/cartProduct.model.js';
import UserModel from '../models/user.model.js';

const addItemToCartController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const {productId, quantity = 1, size, color} = req.body;

        if (!productId) {
            throw createError.BadRequest('ProductId and Quantity fields cannot be empty');
        }

        const checkItemInCart = await CartProductModel.findOne({
            user: userId,
            product: productId,
        });
        if (checkItemInCart) {
            throw createError.BadRequest('Item already in cart');
        }

        const cartItem = new CartProductModel({
            quantity,
            user: userId,
            product: productId,
            size,
            color,
        });
        const save = await cartItem.save();

        const updateCartOwner = await UserModel.updateOne({_id: userId}, {
            $push: {
                shopping_cart: save._id,
            }
        });

        if (!updateCartOwner) {
            throw createError.InternalServerError('Add item to cart failed');
        }

        res.status(200).json({
            success: true,
            error: false,
            data: save,
        });
    } catch (err) {
        next(err);
    }
}

const getCartItemsController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const cartItems = await CartProductModel.find({
            user: userId,
        }).populate('product');

        res.status(200).json({
            success: true,
            error: false,
            data: cartItems,
        });
    } catch (err) {
        next(err);
    }
}

const updateCartItemQuantityController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const {productId, quantity} = req.body;

        if (!productId || !quantity) {
            throw createError.BadRequest('ProductId and quantity fields cannot be empty');
        }

        const updateCartItem = await CartProductModel.updateOne({
            user: userId,
            product: productId,
        }, {
            quantity,
        });
        if (!updateCartItem) {
            throw createError.InternalServerError('Cart item quantity update failed');
        }

        res.status(200).json({
            success: true,
            error: false,
            data: updateCartItem,
        });
    } catch (err) {
        next(err);
    }
}

const deleteCartItemController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const cartId = req.params.id;
        if (!cartId) {
            throw createError.BadRequest('CartId cannot be empty');
        }

        const deleteCartItem = await CartProductModel.findByIdAndDelete(cartId);
        if (!deleteCartItem) {
            throw createError.InternalServerError('Delete failed');
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw createError.InternalServerError('Unable to fetch user cart details');
        }

        user.shopping_cart = user.shopping_cart.filter(cartProductId => cartProductId === cartId);
        await user.save();

        res.status(200).json({
            success: true,
            error: false,
            message: 'Cart item deleted',
        });
    } catch (err) {
        next(err);
    }
}

export {
    addItemToCartController,
    getCartItemsController,
    updateCartItemQuantityController,
    deleteCartItemController,
};