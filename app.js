import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import createHttpError from 'http-errors';
import {connectDB} from './utils/connectDB.js';

dotenv.config();

const app = express();

app.use(cors({
    credentials: true,
    origin: '*'
    // origin: process.env.FRONTEND_URL
}));
app.options('*', cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined'));
app.use(helmet({
    crossOriginResourcePolicy: false
}));

const PORT = process.env.PORT ?? 3000;

app.get('/', (req, res) => {
    res.json({
        status: 200,
        message: 'Success',
    });
});

// on route not found
app.use(function (req, res, next) {
    next(createHttpError(404, 'Route not found!'));
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        status: 'Failure',
        message: err.message,
    });
});

app.listen(PORT, () => {
    connectDB();
    console.log('Server is running on port:', PORT);
});
