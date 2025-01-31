import createError from 'http-errors';
import bcrypt from 'bcrypt';
import {UserModel} from '../models/index.js';

const registerUserController = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;
        if (!name || !email || !password) {
            throw createError.NotFound('Name, email or password cannot be empty');
        }
        const user = await UserModel.findOne({email});
        if (user) {
            throw createError.Conflict('Email already registered');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const payload = {
            name,
            email,
            password: hashedPassword,
        };
        await UserModel.create(payload);
        res.status(200).json({
            status: 'success',
            message: 'User created.',
        });
    } catch (err) {
        next(err);
    }
};

export {
    registerUserController
};