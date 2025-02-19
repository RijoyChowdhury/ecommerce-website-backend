import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    address_line_1 : {
        type: String,
        default: '',
    },
    address_line_2 : {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        default: '',
    },
    pincode: {
        type: String,
    },
    country: {
        type: String,
    },
    mobile: {
        type: Number,
        default: null,
    },
    status: {
        type: Boolean,
        default: true,
    },
    location_type: {
        type: String,
        enum: ['home', 'office'],
        default: 'home',
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
    },
}, {
    timestamps: true,
});

const AddressModel = mongoose.model('address', addressSchema);

export default AddressModel;