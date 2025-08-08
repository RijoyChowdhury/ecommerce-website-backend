import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
    },
    orderId: {
        type: String,
        required: [true, 'orderId field cannot be empty'],
        unique: true,
    },
    invoice_receipt: {
        type: String,
        default: '',
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'product',
    },
    product_details: {
        name: String,
        image: Array,
    },
    paymentMode: {
        type: String,
        default: '',
    },
    payment_status: {
        type: String,
        default: '',
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address',
    },
    total_amt: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true,
});

const OrderModel = mongoose.model('order', orderSchema);

export default OrderModel;