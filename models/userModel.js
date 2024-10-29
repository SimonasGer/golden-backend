const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { type } = require("os");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    confirmPassword: {
        type: String,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords do not match",
        },
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    posts: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
    ],
    comments: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
    ],
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
    ]
})

userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified or is new
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete confirmPassword field after validation
    this.confirmPassword = undefined;
    next();
});

userSchema.methods.correctPassword = async (
    candidatePassword,
    userPassword) => {
        return await bcrypt.compare(candidatePassword, userPassword)
    };

const User = mongoose.model("User", userSchema);

module.exports = User;