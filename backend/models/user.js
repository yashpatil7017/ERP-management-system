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
        lowercase: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
        lowercase: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

userSchema.pre("save", function syncStatusAndIsActive() {
    if (this.isModified("status")) {
        this.isActive = this.status === "active";
    } else if (this.isModified("isActive")) {
        this.status = this.isActive ? "active" : "inactive";
    }
});

export default mongoose.model("User", userSchema);