import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return typeof v === "string" && isNaN(v);  // ✅ Prevents numbers being auto-converted
            },
            message: "Name must be a non-numeric string!",
        },
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verificationToken: { type: String },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["manager", "employee"], default: "employee" },
}, {
    timestamps: true,
    strict: "throw", // ✅ This prevents extra fields like "iddd"
});


const User=mongoose.model("User",userSchema)

export default User;