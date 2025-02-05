import createError from 'http-errors';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true,
});

const uploadOptions = {
    use_filename: true,
    unique_filename: false,
    overwrite: false,
};

let imageArray = new Array();

const uploadImages = async (req, res, next) => {
    try {
        imageArray = new Array();
        const imageFiles = req?.files;
        
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const img = await cloudinary.uploader.upload(
                file.path,
                uploadOptions,
                (err, result) => {
                    if (err) {
                        next(err);
                    }
                    imageArray.push(result.secure_url);
                    fs.unlinkSync(`uploads/${file.filename}`); // delete the files after upload
                }
            );
        }
        // return imageArray;
        res.status(200).json({
            success: true,
            error: false,
            data: imageArray,
        });
    } catch (err) {
        next(err);
    }
}

const deleteImage = async (req, res, next) => {
    try {
        const imgName = req.params.id; // image name without ext

        if (imgName) {
            const result = await cloudinary.uploader.destroy(imgName, (err, result) => {
                if (err) next(err);
            });

            if (result) {
                res.status(200).json({
                    success: true,
                    error: false,
                    message: 'Deleted successfully',
                });
            } else {
                throw createError.BadRequest('Deletion failed');
            }
        }
    } catch (err) {
        next(err);
    }
}

export {
    uploadImages,
    deleteImage,
};