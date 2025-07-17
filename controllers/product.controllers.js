import createError from 'http-errors';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import ProductModel from "../models/product.model.js";
import CategoryModel from '../models/category.model.js';
import UserModel from '../models/user.model.js';
import mongoose from 'mongoose';

const generateFilterPayload = (queryObject) => {
    const rating = parseFloat(queryObject.rating) || 0.0;
    const keyword = queryObject.keyword || '';
    const category = queryObject.category || '';
    const size = queryObject.size || '';
    const color = queryObject.color || '';

    const price_range = queryObject.price_range || '';

    const filterPayload = {
        rating: { $gte: rating },
    };

    if (keyword) {
        filterPayload.name = { $regex: keyword, $options: 'i' };
        filterPayload.description = { $regex: keyword, $options: 'i' };
    }

    if (category) {
        const categoryIds = category ? category.split(',').map(id => new mongoose.Types.ObjectId(id)) : [];
        console.log(categoryIds);
        filterPayload.category = { $in: categoryIds };
    }

    if (size) {
        filterPayload.size = size;
    }

    if (color) {
        filterPayload.color = color;
    }

    if (price_range) {
        const [low, high] = price_range ? price_range.split(',') : [];
        filterPayload.price = { $gte: parseInt(low), $lte: parseInt(high) };
    }

    return filterPayload;
}

const createProductController = async (req, res, next) => {
    try {
        const category = CategoryModel.findById(req.body.category);
        if (!category) {
            throw createError.NotFound('Invalid category');
        }

        const product = new ProductModel({
            ...req.body
        });

        const result = await product.save();
        if (!result) {
            throw createError.InternalServerError('Request failed')
        }

        res.status(200).json({
            success: true,
            error: false,
            data: product,
        });
    } catch (err) {
        next(err);
    }
}

const getAllProductsController = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;
        const rating_order = parseInt(req.query.rating_order) || 0;
        const name_order = parseInt(req.query.name_order) || 0;
        const price_order = parseInt(req.query.price_order) || 0;

        const filterPayload = generateFilterPayload(req.query);

        let productList = ProductModel.find(filterPayload)
            .populate({
                path: 'category',
                select: 'name parentCategory',
            })

        if (rating_order) {
            productList = productList.sort({ rating: rating_order });
        }

        if (name_order) {
            productList = productList.sort({ name: name_order });
        }

        if (price_order) {
            productList = productList.sort({ price: price_order });
        }

        productList = await productList
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!productList) {
            throw createError.NotFound('No products found');
        }

        const aggregation = (await ProductModel.aggregate([
            {
                $match: filterPayload,
            },
            {
                $group: {
                    _id: null,
                    maxPrice: { $max: "$price" },
                    minPrice: { $min: "$price" },
                    totaldocs: { $sum: 1 },
                },
            },
        ]));

        const brandAggregation = (await ProductModel.aggregate([
            {
                $match: filterPayload
            },
            {
                $group: {
                    _id: '$brand',
                    count: { $sum: 1 },
                },
            },
        ]));

        const stockAggregation = (await ProductModel.aggregate([
            {
                $match: {...filterPayload, stockCount: {$gt: 0}}
            },
            {
                $count: 'inStock'
            },
        ]));

        // const { maxPrice, minPrice, totaldocs } = aggregation[0] ?? {maxPrice: 0, minPrice: 0, totaldocs: 0};
        const { maxPrice = 0, minPrice = 0, totaldocs = 0 } = aggregation[0] || {};
        const { inStock = 0 } = stockAggregation[0] || {};

        const totalPages = Math.ceil(totaldocs / perPage);
        if (totalPages && page > totalPages) {
            throw createError.NotFound('Page not found');
        }

        res.status(200).json({
            success: true,
            error: false,
            count: productList.length,
            result_metadata: {
                max_price: maxPrice,
                min_price: minPrice,
                in_stock: inStock,
                total_docs: totaldocs,
                brands: brandAggregation,
                current_page: page,
                total_pages: totalPages > 0 ? totalPages : 1,
            },
            data: productList,
        });
    } catch (err) {
        next(err);
    }
}

const getfeaturedProductsController = async (req, res, next) => {
    try {
        const featuredProducts = await ProductModel.aggregate([{ $sample: { size: 24 } }]);
        if (!featuredProducts) {
            throw createError.NotFound('No products found');
        }

        res.status(200).json({
            success: true,
            error: false,
            count: featuredProducts.length,
            data: featuredProducts,
        });
    } catch (err) {
        next(err);
    }
}

const deleteProductController = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const deleteProduct = await ProductModel.findByIdAndDelete(productId);
        if (!deleteProduct) {
            throw createError.NotFound('Invalid id');
        }

        res.status(200).json({
            success: true,
            error: false,
            message: 'Delete successful',
        });
    } catch (err) {
        next(err);
    }
}

const getProductDetailsController = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const productDetails = await ProductModel.findById(productId).populate({
            path: 'review',
            populate: {
                path: 'user',
                model: UserModel,
                select: 'name'
            }
        });
        if (!productDetails) {
            throw createError.NotFound('Invalid product id');
        }

        res.status(200).json({
            success: true,
            error: false,
            data: productDetails,
        });
    } catch (err) {
        next(err);
    }
}

const updateProductDetailsController = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const productDetails = await ProductModel.findById(productId);
        if (!productDetails) {
            throw createError.NotFound('Invalid product id');
        }

        const saveDetails = await ProductModel.findByIdAndUpdate(productId, {
            ...req.body,
        }, {
            new: true,
        });
        if (!saveDetails) {
            throw createError.InternalServerError('Operation failed');
        }

        res.status(200).json({
            success: true,
            error: false,
            data: saveDetails,
        });
    } catch (err) {
        next(err);
    }
}

export {
    createProductController,
    getAllProductsController,
    deleteProductController,
    getProductDetailsController,
    updateProductDetailsController,
    getfeaturedProductsController,
};