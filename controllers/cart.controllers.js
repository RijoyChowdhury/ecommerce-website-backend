import createError from 'http-errors';
import CartProductModel from '../models/cartProduct.model.js';
import UserModel from '../models/user.model.js';
import Stripe from 'stripe';
import { json } from 'express';

const frontend_base_url = process.env.FRONTEND_BASE_URL;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

function generateOrderId() {
  const min = 10000000; // Smallest 8-digit number
  const max = 99999999; // Largest 8-digit number
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

function createItemsList(items) {
    return items.map(item => {
        return {
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.product.name,
                    description: item.product.description,
                    images: item.product.images,
                },
                unit_amount: Math.ceil(item.product.price) * 100,
            },
            quantity: item.quantity,
        };
    });
}

const addItemToCartController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { productId, quantity = 1, size, color } = req.body;

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

        const updateCartOwner = await UserModel.updateOne({ _id: userId }, {
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
        const { productId, quantity } = req.body;

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

const checkoutController = async (req, res, next) => {
    const {email, items, payment_method_types, metadata} = req.body;
    const cart_items = createItemsList(items);
    
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: cart_items,
            customer_email: email,
            client_reference_id: generateOrderId(),
            mode: 'payment',
            payment_method_types,
            success_url: `${frontend_base_url}/paymentsuccess?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontend_base_url}/checkout`,
            invoice_creation: {
                enabled: true,
                invoice_data: {
                    rendering_options: {
                        amount_tax_display: 'exclude_tax'
                    }
                },
            },
            metadata,
            custom_fields: [
                {
                    key: 'custom_message',
                    label: { type: 'custom', custom: 'Custom Delivery Message' },
                    type: 'text',
                    optional: true,
                }
            ]
        });

        res.status(200).json({
            success: true,
            error: false,
            data: {
                payment_url: session.url,
            },
        });
    } catch (err) {
        console.log(err)
        next(err);
    }
}

const getCheckoutDetailsController = async (req, res, next) => {
    try {
        const sessionId = req.params.id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session) {
            res.status(200).json({
                success: true,
                error: false,
                data: session,
            });
        } else {
            throw createError.BadRequest('Invalid Checkout Session Id');
        }
    } catch (err) {
        next(err);
    }
}

export {
    addItemToCartController,
    getCartItemsController,
    updateCartItemQuantityController,
    deleteCartItemController,
    checkoutController,
    getCheckoutDetailsController,
};