import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'product',
    },
    quantity: {
        type: Number,
        default: 1,
    },
    size_variant: {
        type: String,
        default: null,
    },
    color_variant: {
        type: String,
        default: null,
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
    },
}, {
    timestamps: true,
});

const CartProductModel = mongoose.model(cartProductSchema);

export default CartProductModel;