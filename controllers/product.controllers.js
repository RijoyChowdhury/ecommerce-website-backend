import createError from 'http-errors';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import ProductModel from "../models/product.model.js";
import CategoryModel from '../models/category.model.js';

const createProductController = async (req, res, next) => {
    try {
        const {
            name,
            description,
            brand,
            price,
            oldPrice,
            discount,
            categoryId,
            stockCount,
            rating,
            productImages,
        } = req.body;

        const category = CategoryModel.findById(categoryId);
        if (!category) {
            throw createError.NotFound('Invalid category');
        }

        const product = new ProductModel({
            name,
            description,
            brand,
            price,
            oldPrice: oldPrice ? oldPrice : price,
            discount,
            category: categoryId,
            stockCount,
            rating,
            images: productImages,
        });

        const result = await product.save();
        if (!result) {
            throw createError.InternalServerError('Request failed')
        }

        res.status(200).json({
            success: true,
            error: false,
            data: product,
            role: req.userRole,
        });
    } catch (err) {
        next(err);
    }
}

const getAllProductsController = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            throw createError.NotFound('Page not found');
        }

        const productList = await ProductModel.find()
            .populate('category')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!productList) {
            throw createError.NotFound('No products found');
        }

        res.status(200).json({
            success: true,
            error: false,
            page,
            totalPages,
            data: productList,
        });
    } catch (err) {
        next(err);
    }
}

const getAllProductsByCategoryController = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = CategoryModel.findById(categoryId);
        if (!category) {
            throw createError.NotFound('Invalid category');
        }

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            throw createError.NotFound('Page not found');
        }

        const productList = await ProductModel.find({ category: categoryId })
            .populate('category')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!productList) {
            throw createError.NotFound('No products found');
        }

        res.status(200).json({
            success: true,
            error: false,
            page,
            totalPages,
            data: productList,
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
        const productDetails = await ProductModel.findById(productId);
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

        const {
            name,
            description,
            brand,
            price,
            oldPrice,
            discount,
            categoryId,
            stockCount,
            rating,
            productImages,
        } = req.body;

        productDetails.name = name;

        const saveDetails = await productDetails.save();
        if (!saveDetails) {
            throw createError.InternalServerError('Operation failed');
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

export {
    createProductController,
    getAllProductsController,
    getAllProductsByCategoryController,
    deleteProductController,
    getProductDetailsController,
    updateProductDetailsController,
};