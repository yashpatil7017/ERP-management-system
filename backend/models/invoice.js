import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
{
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    salesOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalesOrder",
        required: true,
        index: true,
    },

    customerName: {
        type: String,
        required: true,
        trim: true,
    },

    customerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },

    customerPhone: {
        type: String,
        default: "",
    },

    billingAddress: {
        type: String,
        default: "",
    },

    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            productName: {
                type: String,
                required: true,
            },
            quantity: Number,
            price: Number
            ,
            total: Number,
        }
    ],

    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },

    tax: {
        type: Number,
        default: 0,
        min: 0,
    },

    discount: {
        type: Number,
        default: 0,
        min: 0,
    },

    total: {
        type: Number,
        required: true,
        min: 0,
    },

    status: {
        type: String,
        enum: ["paid", "unpaid", "pending"],
        default: "unpaid",
        lowercase: true,
    },

    invoiceDate: {
        type: Date,
        default: Date.now,
    },

},
{
    timestamps: true
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
