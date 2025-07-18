const mongoose = require("mongoose");
const { type } = require("os");
const mercSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    likes: 
    [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    comments: {
        type: Array,
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now(),
        select: false,
    },
})


const Merc = mongoose.model("Merc", mercSchema);
module.exports = Merc;