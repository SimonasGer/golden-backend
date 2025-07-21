const Merc = require("../models/mercModel");
const User = require("../models/userModel");
const { generateMultipleMercs } = require("../logic/generateMerc");
// ROUTE FUNCTIONS
exports.getHiredMercs = async (req, res) => {
    try {
        const bossId = req.user.id; // comes from JWT
        const mercs = await Merc.find({ boss: bossId });

        res.status(200).json({
            status: "success",
            data: {
                mercs,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Failed to get hired mercs" });
    }
};

exports.createMerc = async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 1;
        const generatedMercs = generateMultipleMercs(count);

        res.status(201).json({
        status: "success",
        data: {
            mercs: generatedMercs
        },
        });
    } catch (err) {
        console.error("Error creating mercs:", err);
        res.status(500).json({ status: "error", message: "Failed to create mercs" });
    }
};

exports.hireMerc = async (req, res) => {
    try {
        const userId = req.user.id; // 🔒 from JWT
        const merc = req.body;

        if (!merc) {
        return res.status(400).json({ message: "Missing merc data" });
        }

        const user = await User.findById(req.user.id);
        const mercPrice = merc.price || 100;

        if (user.gold < mercPrice) {
        return res.status(400).json({ message: "Not enough gold" });
        }

        user.gold -= mercPrice;
        await user.save();

        const savedMerc = await Merc.create({
        ...merc,
        boss: userId,
        status: "hired"
        });

        res.status(201).json({
            status: "success",
            data: {
                merc: savedMerc
            }
        });
    } catch (err) {
        console.error("Error hiring merc:", err);
        res.status(500).json({ message: "Failed to hire merc" });
    }
};

exports.fireMerc = async (req, res) => {
    try {
        await Merc.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status: "success",
            data: {
                merc: "deleted",
            },
        });
    } catch (err) {
        console.log(err);
    }
};