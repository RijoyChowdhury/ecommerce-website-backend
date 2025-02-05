import createError from 'http-errors';
import WishListProductModel from '../models/wishlist.model.js';
import UserModel from '../models/user.model.js';

const addItemToWishlistController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const {productId} = req.body;

        if (!productId) {
            throw createError.BadRequest('ProductId cannot be empty');
        }

        const checkItemInWishlist = await WishListProductModel.findOne({
            user: userId,
            product: productId,
        });
        if (checkItemInWishlist) {
            throw createError.BadRequest('Item already added to wishlist');
        }

        const wishlistItem = new WishListProductModel({
            user: userId,
            product: productId,
        });
        const save = await wishlistItem.save();

        const updateWishlist = await UserModel.updateOne({_id: userId}, {
            $push: {
                wishlist: save._id,
            }
        });

        if (!updateWishlist) {
            throw createError.InternalServerError('Add item to wishlist failed');
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

const getWishlistItemsController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const wishlistItems = await WishListProductModel.find({
            user: userId,
        }).populate('product');

        res.status(200).json({
            success: true,
            error: false,
            data: wishlistItems,
        });
    } catch (err) {
        next(err);
    }
}

const deleteWishlistItemController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const wishlistId = req.params.id;
        if (!wishlistId) {
            throw createError.BadRequest('WishlistId cannot be empty');
        }

        const deleteWishlistItem = await WishListProductModel.findByIdAndDelete(wishlistId);
        if (!deleteWishlistItem) {
            throw createError.InternalServerError('Delete failed');
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw createError.InternalServerError('Unable to fetch user wishlist details');
        }

        user.wishlist = user.wishlist.filter(itemtId => itemtId === wishlistId);
        await user.save();

        res.status(200).json({
            success: true,
            error: false,
            message: 'Wishlist item deleted',
        });
    } catch (err) {
        next(err);
    }
}

export {
    addItemToWishlistController,
    getWishlistItemsController,
    deleteWishlistItemController,
};