const Merc = require("../models/mercModel");
const User = require("../models/userModel");
const { generateMultipleMercs } = require("../logic/generateMerc");
// ROUTE FUNCTIONS
exports.getHiredMercs = async (req, res) => {
    try {
        const bossId = req.user.id; // comes from JWT
        const user = await User.findById(bossId);
        const mercs = await Merc.find({ boss: bossId });

        res.status(200).json({
            status: "success",
            data: {
                mercs,
                gold: user.gold,
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
        const userId = req.user.id; // comes from JWT
        const user = await User.findById(userId);
        const gold = user.gold;
        const generatedMercs = generateMultipleMercs(count);

        res.status(201).json({
        status: "success",
        data: {
            mercs: generatedMercs,
            gold: gold,
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
            return res.status(201).json(
                { message: "Not enough gold to hire this merc" }
            );
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

exports.healMerc = async (req, res) => {
    try {
        const userId = req.user.id; // 🔒 from JWT
        const user = await User.findById(userId);
        const mercId = req.params.id;
        const merc = await Merc.findById(mercId);
        if (!merc) {
            return res.status(404).json({ message: "Merc not found" });
        }
        if (merc.injuryStatus !== "injured") {
            return res.status(400).json({ message: "Merc is not injured" });
        }
        if (user.gold < 100) {
            return res.status(400).json({ message: "Not enough gold to heal merc" });
        }
        merc.injuryStatus = "healthy";
        user.gold -= 100; // Deduct healing cost
        await user.save();
        await merc.save();
        res.status(200).json({
            status: "success",
            data: {
                merc
            }
        });
    } catch (err) {
        console.error("Error healing merc:", err);
        res.status(500).json({ message: "Failed to heal merc" });
    }
}

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