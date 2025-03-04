import mongoose from "mongoose";

export const UserRoles = {
    ADMIN: 'Admin',
    USER: 'User',
};

const userSchema = new mongoose.Schema({
    userPrefix: {
        type: String,
        required: [true, 'name prefix field cannot be empty'],
    },
    firstName: {
        type: String,
        required: [true, 'first name field cannot be empty'],
    },
    lastName: {
        type: String,
        required: [true, 'last name field cannot be empty'],
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
    // access_token: {
    //     type: String,
    //     default: '',
    // },
    refresh_token: {
        type: String,
        default: '',
    },
    isVerified: {
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
    wishlist: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'wishlistProduct',
        }
    ],
    order_history: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'order',
        }
    ],
    otp: {
        type: String,
        default: null,
    },
    otp_expiry: {
        type: Date,
        default: '',
    },
    // forgot_password_otp: {
    //     type: String,
    //     default: null,
    // },
    // forgot_password_expiry: {
    //     type: Date,
    //     default: '',
    // },
    role: {
        type: String,
        enum: Object.values(UserRoles),
        default: 'User',
    },
}, {
    timestamps: true, // this creates 2 flags createdAt & updatedAt
});

const UserModel = mongoose.model('user', userSchema);

export default UserModel;