import createError from 'http-errors';
import ReviewModel from '../models/review.model.js';
import ProductModel from "../models/product.model.js";

const getAllReviews = async (req, res, next) => {
    try {
        const productId = req.params.id;

        const reviewList = await ReviewModel.find({product: productId}).populate('user', 'name');

        if (!reviewList) {
            throw createError.NotFound('No review found');
        }

        res.status(200).json({
            success: true,
            error: false,
            data: reviewList,
        });
    } catch (err) {
        next(err);
    }
};

const getNext5Reviews = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const index = parseInt(req.params.index);
        const startIndex = isNaN(index) ? 0 : index;

        const reviewList = await ReviewModel.find({product: productId}).populate('user', 'name');

        if (!reviewList) {
            throw createError.NotFound('No review found');
        }

        const slicedReviewList = reviewList.slice(startIndex, startIndex + 5);
        const isLastSet = reviewList.slice(startIndex + 5, startIndex + 6).length === 0;

        res.status(200).json({
            success: true,
            error: false,
            data: slicedReviewList,
            isLastSet, 
        });
    } catch (err) {
        next(err);
    }
};

const postReview = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const {
            comment,
            userId,
        } = req.body;

        const productDetails = await ProductModel.findById(productId);
        if (!productDetails) {
            throw createError.NotFound('Invalid product id');
        }

        const newReview = new ReviewModel({
            comment,
            user: userId,
            product: productId,
        });
        const result = await newReview.save();
        if (!result) {
            throw createError.InternalServerError('Request failed')
        }

        const updateProductReviews = await ProductModel.updateOne({ _id: productId }, {
            $push: {
                review: result._id,
            }
        });
        if (!updateProductReviews) {
            throw createError.InternalServerError('Adding product review failed');
        }

        res.status(200).json({
            success: true,
            error: false,
        });
    } catch (err) {
        next(err);
    }
};

const likeReview = async (req, res, next) => {
    try {
        const reviewId = req.params.id;

        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            throw createError.NotFound('Invalid review id');
        }

        review.like = review.like + 1;

        const result = await review.save();
        if (!result) {
            throw createError.InternalServerError('Request failed')
        }

        res.status(200).json({
            success: true,
            error: false,
        });
    } catch (err) {
        next(err);
    }
};

const dislikeReview = async (req, res, next) => {
    try {
        const reviewId = req.params.id;

        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            throw createError.NotFound('Invalid review id');
        }

        review.dislike = review.dislike + 1;

        const result = await review.save();
        if (!result) {
            throw createError.InternalServerError('Request failed')
        }

        res.status(200).json({
            success: true,
            error: false,
        });
    } catch (err) {
        next(err);
    }
};

export {
    getAllReviews,
    getNext5Reviews,
    postReview,
    likeReview,
    dislikeReview,
};