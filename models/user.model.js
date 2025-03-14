import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name field cannot be empty'],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'email field cannot be empty'],
    },
    password: {
        type: String,
        required: [true, 'password field cannot be empty'],
    },
    avatar: {
        type: String,
        default: '',
    },
    mobile: {
        type: Number,
        default: '',
    },
    refresh_token: {
        type: String,
        default: '',
    },
    verified_email: {
        type: Boolean,
        default: false,
    },
    last_login_date: {
        type: Date,
        default: '',
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active',
    },
    address: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'address',
        }
    ],
    shopping_cart: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'cartProduct',
        }
    ],
    order_history: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'order',
        }
    ],
    forgot_password_otp: {
        type: String,
        default: null,
    },
    forgot_password_expiry: {
        type: Date,
        default: '',
    },
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User',
    },
}, {
    timestamps: true, // this creates 2 flags createdAt & updatedAt
});

const UserModel = mongoose.model('user', userSchema);

export default UserModel;