import createError from 'http-errors';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import CategoryModel from "../models/category.model.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true,
});

// upload images
let imageArray = new Array();
const uploadCategoryImagesController = async (req, res, next) => {
    try {
        imageArray = new Array();
        
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < req?.files?.length; i++) {
            const file = req.files[i];
            const img = await cloudinary.uploader.upload(
                file.path,
                options,
                (err, result) => {
                    imageArray.push(result.secure_url);
                    fs.unlinkSync(`uploads/${file.filename}`); // delete the files after upload
                }
            );
        }

        res.status(200).json({
            images: imageArray,
        });
    } catch (err) {
        next(err);
    }
}

const createCategoryController = async (req, res, next) => {
    try {
        const category = new CategoryModel({
            ...req.body,
        });
        if (!category) {
            throw createError.BadRequest('Entry failed');
        }

        await category.save();
        // imageArray = new Array();

        const updateParentCategory = await CategoryModel.updateOne({ _id: category.parentCategory }, {
            hasSubcategory: true,
            $push: {
                subcategories: category._id,
            }
        });
        if (!updateParentCategory) {
            throw createError.InternalServerError('Updating parent category failed');
        }

        res.status(200).json({
            success: true,
            error: false,
            message: 'Entry added',
            data: category
        });
    } catch (err) {
        next(err);
    }
}

const getCategoryListController = async (req, res, next) => {
    try {
        const list = await CategoryModel.find({}, {description: 0});
        if (!list) {
            throw createError.NotFound('No categories found');
        }
        res.status(200).json({
            success: true,
            error: false,
            data: list,
        });
    } catch (err) {
        next(err);
    }
}

const getCategoryDetailsController = async (req, res, next) => {
    try {
        const category = await CategoryModel.findById(req.params.id).populate('subcategories', 'name').populate('parentCategory', 'name');
        if (!category) {
            throw createError.NotFound('Invalid category id');
        }
        res.status(200).json({
            success: true,
            error: false,
            data: category,
        });
    } catch (err) {
        next(err);
    }
}

const deleteCategoryController = async (req, res, next) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            throw createError.NotFound('Invalid category id');
        }

        const subCategories = await CategoryModel.find({ parentCategory: req.params.id });
        const parentCategory = await CategoryModel.findById(category.parentCategory);
        
        // handle all sub-categories
        // for (let category of subCategories) {
        //     // deleteCategory(category);
        // }
        if (subCategories && subCategories.length > 0) {
            throw createError.BadRequest('Operation failed. Cannot delete category with sub-categories present.');
        }

        const deleteCategory = await CategoryModel.findByIdAndDelete(req.params.id);
        if (!deleteCategory) {
            throw createError.BadRequest('Operation failed');
        }

        // Delete category reference from parent
        parentCategory.subcategories = parentCategory.subcategories.filter(id => id === category._id);
        if (parentCategory.subcategories.length === 0) {
            parentCategory.hasSubcategory = false;
        }
        const deleteSubcategory = await parentCategory.save();
        if (!deleteSubcategory) {
            throw createError.BadRequest('Operation failed');
        }

        res.status(200).json({
            success: true,
            error: false,
            message: 'Category deleted',
        });
    } catch (err) {
        next(err);
    }
}

const updateCategoryController = async (req, res, next) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            throw createError.NotFound('Invalid category id');
        }

        const updateCategoryDetails = await CategoryModel.findByIdAndUpdate(req.params.id, {
            ...req.body,
        }, {
            new: true,
        });
        if (!updateCategoryDetails) {
            throw createError.InternalServerError('Operation failed');
        }

        res.status(200).json({
            success: true,
            error: false,
            message: 'Category updated',
            data: updateCategoryDetails,
        });
    } catch (err) {
        next(err);
    }
}

export {
    uploadCategoryImagesController,
    createCategoryController,
    getCategoryListController,
    getCategoryDetailsController,
    deleteCategoryController,
    updateCategoryController,
};
