import mongoose from "mongoose";

const salesOrderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
        index: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
                min: 0,
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "shipped", "delivered", "cancelled"],
        default: "pending",
        lowercase: true,
    },
}, { timestamps: true });

const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);

export default SalesOrder;
