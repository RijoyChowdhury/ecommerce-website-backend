import jwt from 'jsonwebtoken';
import createError from 'http-errors';

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req?.headers?.authorization?.split(' ')[1];
        if (!token) {
            throw createError.Unauthorized('Access token missing'); 
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
        if (!decode) {
            throw createError.Unauthorized('Access denied');
        }

        req.userId = decode.id;
        req.userRole = decode.role;
        next();
    } catch (err) {
        next(err);
    }
}

export {auth};