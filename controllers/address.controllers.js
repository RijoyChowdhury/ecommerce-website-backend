import createError from 'http-errors';
import { UserModel } from '../models/index.js';
import AddressModel from '../models/address.model.js';

const addAddressController = async (req, res, next) => {
    try {
        const userId = req.userId; // from auth middleware
        const {
            address_line_1, 
            address_line_2, 
            city,
            state,
            country,
            pincode,
            mobile,
            location_type,
            status,
        } = req.body;

        if (!address_line_1 || !country || !pincode || !mobile) {
            throw createError.BadRequest('Address, country, pincode or mobile number cannot be empty');
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw createError.NotFound('User not found');
        }

        const payload = {
            address_line_1, 
            address_line_2, 
            city,
            state,
            country,
            pincode,
            mobile,
            location_type,
            status,
            user: userId,
        };
        const newAddress = new AddressModel(payload);
        await newAddress.save();

        const updateUser = await UserModel.updateOne({_id: userId}, {
            $push: {
                address: newAddress._id,
            }
        });

        if (!updateUser) {
            throw createError.InternalServerError('Adding user address failed');
        }

        res.status(200).json({
            success: true,
            error: false,
            message: 'Address added.',
        });
    } catch (err) {
        next(err);
    }
}

const updateAddressController = async (req, res, next) => {
    try {
        const userId = req.userId; // from auth middleware
        const {
            address_line_1, 
            address_line_2, 
            city,
            state,
            country,
            pincode,
            mobile,
            location_type,
            status,
            id,
        } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) {
            throw createError.NotFound('User not found');
        }

        const address = await AddressModel.findById(id);
        if (!address) {
            throw createError.NotFound('Address not found');
        }

        await AddressModel.findByIdAndUpdate(id, {
            address_line_1, 
            address_line_2, 
            city,
            state,
            country,
            pincode,
            mobile,
            location_type,
            status,
        }, {
            new: true,
        });

        res.status(200).json({
            success: true,
            error: false,
            message: 'Address updated.',
        });
    } catch (err) {
        next(err);
    }
}

const getAddressController = async (req, res, next) => {
    try {
        const userId = req.userId; // from auth middleware
        const addressId = req.params.id;
        
        const user = await UserModel.findById(userId);
        if (!user) {
            throw createError.NotFound('User not found');
        }

        const address = await AddressModel.findById(addressId);
        if (!address) {
            throw createError.NotFound('Address not found');
        }

        res.status(200).json({
            success: true,
            error: false,
            data: address,
        });
    } catch (err) {
        next(err);
    }
}

const getAllAddressController = async (req, res, next) => {
    try {
        const userId = req.userId; // from auth middleware        
        const user = await UserModel.findById(userId);
        if (!user) {
            throw createError.NotFound('User not found');
        }

        const addressList = await AddressModel.find({
            user: userId,
        });
        if (!addressList) {
            throw createError.NotFound('Address list empty');
        }

        res.status(200).json({
            success: true,
            error: false,
            data: addressList,
        });
    } catch (err) {
        next(err);
    }
}

export {
    addAddressController,
    updateAddressController,
    getAddressController,
    getAllAddressController,
}