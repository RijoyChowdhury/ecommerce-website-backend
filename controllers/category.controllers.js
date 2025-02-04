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

const createNestedCategories = (categories, parentId = null) => {
    const categoryList = new Array();
    let category;
    if (parentId === null) {
        category = categories.filter(cat => cat.parentId === null);
    } else {
        category = categories.filter(cat => String(cat.parentId) === String(parentId));
    }

    for (let cat of category) {
        categoryList.push({
            _id: cat._id,
            name: cat.name,
            children: nestedCategories(categories, cat._id),
        });
    }

    return categoryList;
}

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
        let {name, parentId} = req.body;
        const category = new CategoryModel({
            name,
            parentId,
        });
        if (!category) {
            throw createError.BadRequest('Entry failed');
        }

        await category.save();
        imageArray = new Array();
        
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
        const list = await CategoryModel.find();
        if (!list) {
            throw createError.NotFound('No categories found');
        }
        res.status(200).json({
            success: true,
            error: false,
            data: createNestedCategories(list),
        });
    } catch (err) {
        next(err);
    }
}

const getCategoryDetailsController = async (req, res, next) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
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

        const subCategories = await CategoryModel.find({parentId: req.params.id});
        for (let category of subCategories) {
            // deleteCategory(category);
        }

        const deleteCategory = await CategoryModel.findByIdAndDelete(req.params.id);
        if (!deleteCategory) {
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

const updateCtaegoryController = async (req, res, next) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            throw createError.NotFound('Invalid category id');
        }
        
        const {name, parentId} = req.body;
        category.name = name;
        category.parentId = parentId;
        await category.save();

        res.status(200).json({
            success: true,
            error: false,
            message: 'Category updated',
            data: category,
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
    updateCtaegoryController,
};
