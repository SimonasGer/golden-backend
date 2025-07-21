const mongoose = require("mongoose");
const { type } = require("os");
const missionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    reward: {
        type: Number,
        required: true,
    },
    stats: {
        strength: { type: Number, default: 5 },
        agility: { type: Number, default: 5 },
        intelligence: { type: Number, default: 5 },
    },
    status: {
        type: String,
        enum: ['inactive', 'pending', 'ongoing', 'completed', 'failed'],
        default: 'inactive'
    },
    taker: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: false,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})


const Mission = mongoose.model("Mission", missionSchema);
module.exports = Mission;