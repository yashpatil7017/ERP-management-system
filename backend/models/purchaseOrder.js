import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
{
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true,
        index: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            },

            price: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },

    status: {
        type: String,
        enum: ["ordered", "received", "cancelled"],
        default: "ordered"
    }
},
{
    timestamps: true
});

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);