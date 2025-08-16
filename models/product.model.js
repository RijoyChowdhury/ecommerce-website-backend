import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: [{
        type: String,
        required: true,
    }],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
    },
    oldPrice: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'category',
        required: true,
    },
    stockCount: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    size: [{
        type: String,
        default: null,
    }],
    color: [{
        type: String,
        default: null,
    }],
    location: [{
        value: {
            type: String,
        },
        label: {
            type: String
        },
    }],
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    review: [{
        type: mongoose.Schema.ObjectId,
        ref: 'review',
    }],
    condition: {
        type: String,
        enum: ['New', 'Refurbished', 'Used'],
        default: 'New',
    }
}, {
    timestamps: true,
});

// productSchema.virtual('id').get(function () {
//     this._id.toHexString();
// });

// productSchema.set('toJSON', {
//     virtuals: true,
// });

const ProductModel = mongoose.model('product', productSchema);

export default ProductModel;