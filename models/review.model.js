import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'product',
    },
    like: {
        type: Number,
        default: 0,
    },
    dislike: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const ReviewModel = mongoose.model('review', reviewSchema);

export default ReviewModel;