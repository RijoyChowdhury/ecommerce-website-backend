import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();
const { MONGODB_URI } = process.env;

const connectDB = () => {
    mongoose
        .connect(MONGODB_URI)
        .catch((error) => console.log(error));

    const connection = mongoose.connection;

    connection.once('open', () => {
        console.log('MongoDB connected successfully.');
    });
};

export {connectDB};