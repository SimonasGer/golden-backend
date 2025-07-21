const Merc = require("../models/mercModel");
const User = require("../models/userModel");
const { generateMultipleMissions } = require("../logic/generateMission");

exports.createMission = async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 1;
        const generatedMissions = generateMultipleMissions(count);

        res.status(201).json({
            status: "success",
            data: {
                missions: generatedMissions
            },
        });
    } catch (err) {
        console.error("Error creating missions:", err);
        res.status(500).json({ status: "error", message: "Failed to create missions" });
    }
};