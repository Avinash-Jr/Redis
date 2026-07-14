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
    },
},{timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const User = mongoose.model("User", userSchema);
export default User;
