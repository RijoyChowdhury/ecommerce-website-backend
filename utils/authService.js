import jwt from 'jsonwebtoken';
import { UserModel } from '../models/index.js';

const generateAccessToken = async (userId) => {
    const token = await jwt.sign({id: userId}, process.env.SECRET_KEY_ACCESS_TOKEN, {expiresIn: '5h'});
    return token;
};

const generateRefreshToken = async (userId) => {
    const token = jwt.sign(
        {id: userId}, 
        process.env.SECRET_KEY_REFRESH_TOKEN, 
        {expiresIn: '7d'}
    );
    const updateUserRefreshToken = await UserModel.findByIdAndUpdate(userId, {
        refresh_token: token,
    });
    return token;
};

export {
    generateAccessToken,
    generateRefreshToken,
};