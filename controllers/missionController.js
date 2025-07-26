const pool = require("../db");
const { generateMultipleMissions } = require("../logic/generateMission");
const { missionSuccess } = require("../logic/missionSuccess");

exports.generateNewMissions = async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 1;
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
        const userId = req.user.id; // comes from JWT
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

exports.getAllAcceptedMissions = async (req, res) => {
    try {
        const userId = req.user.id; // comes from JWT
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
        const userId = req.user.id; // comes from JWT

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

exports.startMission = async (req, res) => {
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

        const goldResult = await pool.query(`SELECT gold FROM users WHERE id = $1`,
            [userId]
        )
        const gold = goldResult.rows[0].gold;
        if (missionResult.wage > gold) {
            return res.status(403).json(
                { message: "Not enough gold to fund this mission." }
            );
        }

        const client = await pool.connect();
        await client.query("BEGIN");
        try {
            await client.query(
                `UPDATE users SET gold = gold - $1 + $2 WHERE id = $3`,
                [missionResult.wage, missionResult.reward, userId]
            );

            for (const merc of missionResult.mercs) {
                await client.query(
                    `UPDATE mercs SET injury_status = $1 WHERE id = $2 AND boss = $3`,
                    [merc.injury_status, merc.id, userId]
                );
            }

            await client.query(
                `UPDATE missions SET status = $1 WHERE id = $2 AND taker = $3`,
                [missionResult.status, missionId, userId]
            );

            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }

        res.status(200).json({
            status: "success",
            data: {
                result: "Successfully started mission",
            }
        });
    } catch (err) {
        console.error("Error updating mission status:", err);
        res.status(500).json({ message: "Failed to update mission status" });
    }
};

exports.getAllPastMissionsByUser = async (req, res) => {
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

exports.deleteMissionFromLogs = async (req, res) => {
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