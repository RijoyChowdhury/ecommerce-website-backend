import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import createError from 'http-errors';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';
import {connectDB} from './utils/connectDB.js';
import appRouter from './routes/index.js';

dotenv.config();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56,
})

const app = express();

app.use(cors({
    credentials: true,
    // origin: '*'
    // origin: process.env.FRONTEND_URL
    origin: true,
}));
app.options('*', cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined'));
app.use(helmet({
    crossOriginResourcePolicy: false
}));
app.use(mongoSanitize());
app.use(limiter);

const PORT = process.env.PORT ?? 3000;

// api routes
app.use("/api", appRouter);

// server healthcheck
app.get('/healthcheck', (req, res) => {
    res.status(200).json({
        success: true,
        error: false,
        message: 'Success',
    });
});

// on route not found
app.use(function (req, res, next) {
    next(createError.NotFound('Route not found!'));
});

// error handler
app.use(function (err, req, res, next) {
    const {message, status} = err;
    res.status(status || 500);
    res.json({
        status: 'failure',
        message,
        error: true, 
        success: false
    });
});

app.listen(PORT, () => {
    connectDB();
    console.log('Server is running on port:', PORT);
});
