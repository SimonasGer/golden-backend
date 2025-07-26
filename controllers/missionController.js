const pool = require("../db");
const { generateMultipleMissions } = require("../logic/generateMission");
const { missionSuccess } = require("../logic/missionSuccess");

exports.generateMission = async (req, res) => {
    const count = parseInt(req.query.count) || 1;
    try {
        const missions = generateMultipleMissions(count);
        res.status(201).json({
            status: "success",
            data: missions,
        });
    } catch (err) {
        console.error("Error creating missions:", err);
        res.status(500).json({ status: "error", message: "Failed to create missions" });
    }
};

exports.acceptMission = async (req, res) => {
    try {
        const userId = req.user.id; // from JWT
        const mission = req.body;

        if (!mission) {
            return res.status(400).json({ message: "Missing mission data" });
        }

        const result = await pool.query(`INSERT INTO missions
            (name, description, strength, agility, intelligence, reward, status, taker, created_at)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING *`,
            [
                mission.name,
                mission.description,
                mission.strength,
                mission.agility,
                mission.intelligence,
                mission.reward,
                'pending',
                userId,
            ]
        );

        res.status(201).json({
            status: "success",
            data: result
        });
    } catch (err) {
        console.error("Error accepting mission:", err);
        res.status(500).json({ message: "Failed to accept mission" });
    }
}

exports.getAllMissions = async (req, res) => {
    try {
        const userId = req.user.id; // 🔒 from JWT
        const result = await pool.query(`SELECT * FROM missions WHERE taker = $1 AND status = 'pending'`,
            [userId]
        );

        const missions = result.rows
        res.status(200).json({
            status: "success",
            data: missions,
        });
    } catch (err) {
        console.error("Error getting missions:", err);
        res.status(500).json({ message: "Failed to get missions" });
    }
}

exports.getMissionById = async (req, res) => {
    try {
        const missionId = parseInt(req.params.id);
        const userId = req.user.id; // from JWT

        const goldResult = await pool.query(`SELECT gold FROM users WHERE id = $1`,
            [userId]
        );
        const gold = goldResult.rows[0].gold;

        const missionResult = await pool.query(`SELECT * FROM missions WHERE id = $1`,
            [missionId]
        );
        const mission = missionResult.rows[0];

        res.status(200).json({
            status: "success",
            data: {
                mission,
                gold,
            }
        });
    } catch (err) {
        console.error("Error getting mission by ID:", err);
        res.status(500).json({ message: "Failed to get mission" });
    }
};

exports.updateMissionStatus = async (req, res) => {
    try {
        const missionId = parseInt(req.params.id);
        const userId = req.user.id;
        const mercIds = req.body.mercIds || [];

        if (!Array.isArray(mercIds) || mercIds.length === 0) {
            return res.status(400).json({ message: "No mercenaries provided" });
        }

        const { rows: mercs } = await pool.query(
            `SELECT * FROM mercs WHERE id = ANY($1::int[]) AND boss = $2`,
            [mercIds, userId]
        );
        if (mercs.length !== mercIds.length) {
            return res.status(400).json({ message: "Invalid mercenary selection" });
        }

        const {rows: missions} = await pool.query(`SELECT * FROM missions WHERE id = $1`,
            [missionId]
        );
        if (missions.length === 0) {
            return res.status(400).json({ message: "Invalid mission" });
        }

        const missionResult = missionSuccess(missions[0], mercs);

        await pool.query("BEGIN");
        try {
            await pool.query(
                `UPDATE users SET gold = gold - $1 + $2 WHERE id = $3`,
                [missionResult.wage, missionResult.reward, userId]
            );

            for (const merc of missionResult.mercs) {
                await pool.query(
                    `UPDATE mercs SET injury_status = $1 WHERE id = $2 AND boss = $3`,
                    [merc.injury_status, merc.id, userId]
                );
            }

            await pool.query(
                `UPDATE missions SET status = $1 WHERE id = $2 AND taker = $3`,
                [missionResult.status, missionId, userId]
            );

            await pool.query("COMMIT");
        } catch (err) {
            await pool.query("ROLLBACK");
            throw err;
        }

        res.status(200).json({
            status: "success",
            data: {
                result: "Successfuly started mission",
            }
        });
    } catch (err) {
        console.error("Error updating mission status:", err);
        res.status(500).json({ message: "Failed to update mission status" });
    }
};

exports.getAllMissionsByUser = async (req, res) => {
    try {
        const userId = req.user.id; // from JWT
        const result = await pool.query(`SELECT * FROM missions WHERE status IN ('completed', 'failed') AND taker = $1 ORDER BY created_at DESC`,
            [userId]
        );
        const missions = result.rows;
        res.status(200).json({
            status: "success",
            data: missions
        });
    } catch (err) {
        console.error("Error getting all missions by user:", err);
        res.status(500).json({ message: "Failed to get missions" });
    }
};

exports.deleteMission = async (req, res) => {
    try {
        const userId = req.user.id
        const missionId = parseInt(req.params.id);
        await pool.query(`DELETE FROM missions WHERE id = $1 AND taker = $2`,
            [missionId, userId]
        );
        res.status(200).json({
            status: "success",
        });
    } catch (err) {
        console.error("Error deleting mission:", err);
        res.status(500).json({ message: "Failed to delete mission" });
    }
}