const Mission = require("../models/missionModel");
const User = require("../models/userModel");
const Merc = require("../models/mercModel");
const { generateMultipleMissions } = require("../logic/generateMission");
const { missionSuccess } = require("../logic/missionSuccess");

exports.generateMission = async (req, res) => {
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

exports.acceptMission = async (req, res) => {
    try {
        const userId = req.user.id; // 🔒 from JWT
        const mission = req.body;

        if (!mission) {
        return res.status(400).json({ message: "Missing mission data" });
        }

        const savedMission = await Mission.create({
        ...mission,
        taker: userId,
        status: "pending"
        });

        res.status(201).json({
            status: "success",
            data: {
                mission: savedMission
            }
        });
    } catch (err) {
        console.error("Error accepting mission:", err);
        res.status(500).json({ message: "Failed to accept mission" });
    }
}

exports.getAllMissions = async (req, res) => {
    try {
        const userId = req.user.id; // 🔒 from JWT
        const missions = await Mission.find({ taker: userId, status: "pending" });

        res.status(200).json({
            status: "success",
            data: {
                missions
            }
        });
    } catch (err) {
        console.error("Error getting missions:", err);
        res.status(500).json({ message: "Failed to get missions" });
    }
}

exports.getMissionById = async (req, res) => {
    try {
        const missionId = req.params.id;
        const userId = req.user.id; // 🔒 from JWT
        const user = await User.findById(userId);
        const mission = await Mission.findById(missionId);

        if (!mission || mission.status !== "pending" || mission.taker.toString() !== userId) {
            return res.status(404).json({ message: "Mission not found" });
        }
        res.status(200).json({
            status: "success",
            data: {
                mission,
                gold: user.gold
            }
        });
    } catch (err) {
        console.error("Error getting mission by ID:", err);
        res.status(500).json({ message: "Failed to get mission" });
    }
};

exports.updateMissionStatus = async (req, res) => {
    try {
        const missionId = req.params.id;
        const userId = req.user.id;
        const mercIds = req.body.mercIds || [];

        // Fetch all mercs in parallel
        const mercs = await Promise.all(
            mercIds.map(id => Merc.findById(id))
        );

        // Filter out any nulls (not found mercs)
        const validMercs = mercs.filter(Boolean);
        if (validMercs.length === 0) {
            return res.status(400).json({ message: "No valid mercs provided" });
        }

        const mission = await Mission.findById(missionId);
        if (!mission) {
            return res.status(404).json({ message: "Mission not found" });
        }
        if (mission.status !== "pending") {
            return res.status(400).json({ message: "Mission is not in a pending state" });
        }

        const result = missionSuccess(mission, validMercs);

        // Update mission status and reward
        mission.status = result.status;
        mission.reward = result.reward;
        await mission.save();

        // Give player gold if successful
        if (result.status === "completed") {
            const user = await User.findById(userId);
            user.gold = user.gold + result.reward - result.wage;
            await user.save();
        }

        // Update merc statuses
        for (let merc of result.mercs) {
            await Merc.findByIdAndUpdate(merc._id, { injuryStatus: merc.status });
        }

        res.status(200).json({
            status: "success",
            data: {
                mission,
                result
            }
        });
    } catch (err) {
        console.error("Error updating mission status:", err);
        res.status(500).json({ message: "Failed to update mission status" });
    }
};

exports.deleteMission = async (req, res) => {
    try {
        const missionId = req.params.id;
        const mission = await Mission.findByIdAndDelete(missionId);
        if (!mission) {
            return res.status(404).json({ message: "Mission not found" });
        }
        res.status(204).json({
            status: "success",
            data: null
        });
    } catch (err) {
        console.error("Error deleting mission:", err);
        res.status(500).json({ message: "Failed to delete mission" });
    }
}