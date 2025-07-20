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
    archetype: {
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
    wage: {
        type: Number,
        required: true,
    },
    stats: {
        strength: { type: Number, default: 5 },
        agility: { type: Number, default: 5 },
        intelligence: { type: Number, default: 5 },
    },
    injuryStatus: {
        type: String,
        enum: ['healthy', 'injured', 'dead'],
        default: 'healthy'
    },
    boss: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: false,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})


const Merc = mongoose.model("Merc", mercSchema);
module.exports = Merc;