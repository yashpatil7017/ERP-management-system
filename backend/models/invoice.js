import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
{
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },

    salesOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalesOrder",
        required: true
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },

            quantity: Number,
            price: Number
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    },

    invoiceDate: {
        type: Date,
        default: Date.now
    },

    paidAt: {
        type: Date,
    },

},
{
    timestamps: true
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
