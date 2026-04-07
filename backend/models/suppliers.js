import mongoose from "mongoose";

// Define the Supplier schema
const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    taxNumber: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

// Create a text index for searching by name, email, and city
supplierSchema.index({ name: "text", email: "text", city: "text" });

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;