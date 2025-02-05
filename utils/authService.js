import jwt from 'jsonwebtoken';
import { UserModel } from '../models/index.js';

const generateAccessToken = async (userId, userRole) => {
    const token = await jwt.sign({id: userId, role: userRole}, process.env.SECRET_KEY_ACCESS_TOKEN, {expiresIn: '5h'});
    return token;
};

const generateRefreshToken = async (userId, userRole) => {
    const token = jwt.sign(
        {id: userId, role: userRole}, 
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