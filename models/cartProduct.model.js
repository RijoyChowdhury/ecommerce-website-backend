import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'product',
    },
    quantity: {
        type: Number,
        default: 1,
    },
    size: {
        type: String,
        default: null,
    },
    color: {
        type: String,
        default: null,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
    },
}, {
    timestamps: true,
});

// cartProductSchema.virtual('id').get(function () {
//     this._id.toHexString();
// });

// cartProductSchema.set('toJSON', {
//     virtuals: true,
// });

const CartProductModel = mongoose.model('cartProduct', cartProductSchema);

export default CartProductModel;