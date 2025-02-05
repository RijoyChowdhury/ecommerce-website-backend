import mongoose from "mongoose";

const wishListProductSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'product',
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
    },
}, {
    timestamps: true,
});

// wishListProductSchema.virtual('id').get(function () {
//     this._id.toHexString();
// });

// wishListProductSchema.set('toJSON', {
//     virtuals: true,
// });

const WishListProductModel = mongoose.model('wishlistProduct', wishListProductSchema);

export default WishListProductModel;