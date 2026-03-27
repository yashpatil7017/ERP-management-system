import mongoose from "mongoose";

const userSchema = new mongoose.Schema({ 
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin","sales", "purchase", "inventory"],
        default: "sales",
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);