const pool = require("../db");
const { generateMultipleMercs } = require("../logic/generateMerc");

// ROUTE FUNCTIONS
exports.getHiredMercs = async (req, res) => {
    const userId = req.user.id; // comes from JWT
    try {
        const mercsResult = await pool.query(`SELECT * FROM mercs WHERE boss = $1`,
            [userId]
        );
        const goldResult = await pool.query(`SELECT gold FROM users WHERE id = $1`,
            [userId]
        );

        const mercs = mercsResult.rows
        const gold = goldResult.rows[0].gold
        res.status(200).json({
            status: "success",
            data: {
                mercs,
                gold,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Failed to get hired mercs" });
    }
};

exports.createMerc = async (req, res) => {
    const count = parseInt(req.query.count) || 1;
    const userId = req.user.id; // comes from JWT
    try {
        const result = await pool.query(`SELECT gold FROM users WHERE id = $1`,
            [userId]
        );
        const generatedMercs = generateMultipleMercs(count);
        const gold = result.rows[0].gold;
        res.status(201).json({
            status: "success",
            data: {
                mercs: generatedMercs,
                gold,
            },
        });
    } catch (err) {
        console.error("Error creating mercs:", err);
        res.status(500).json({ status: "error", message: "Failed to create mercs" });
    }
};

exports.hireMerc = async (req, res) => {
    const userId = req.user.id; // 🔒 from JWT
    const merc = req.body;
    if (!merc) {
        return res.status(400).json({ message: "Missing merc data" });
    }
    try {
        const goldResult = await pool.query(`SELECT gold FROM users WHERE id = $1`,
            [userId]
        )
        let gold = goldResult.rows[0].gold
        if (gold < merc.price) {
            return res.status(201).json(
                { message: "Not enough gold to hire this merc" }
            );
        }

        gold -= merc.price;
        await pool.query(`UPDATE users SET gold = $1 WHERE id = $2`,
            [gold, userId]
        )
        const mercResult = await pool.query(`INSERT INTO mercs
            (first_name, last_name, description, archetype, strength, agility, intelligence, wage, price, injury_status, boss, created_at)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'healthy', $10, NOW())
            RETURNING *`,
            [
                merc.firstName,
                merc.lastName,
                merc.description,
                merc.archetype,
                merc.strength,
                merc.agility,
                merc.intelligence,
                merc.wage,
                merc.price,
                userId,
            ]
        );

        res.status(201).json({
            status: "success",
            data: mercResult,
        });
    } catch (err) {
        console.error("Error hiring merc:", err);
        res.status(500).json({ message: "Failed to hire merc" });
    }
};

exports.healMerc = async (req, res) => {
    const userId = req.user.id; // from JWT
    const mercId = parseInt(req.params.id);
    try {
        const result = await pool.query(`SELECT gold FROM users WHERE id = $1`,
            [userId]
        );
        let gold = result.rows[0].gold;
        if (gold > 100) {
            await pool.query(`UPDATE mercs SET injury_status = 'healthy' WHERE id = $1`,
                [mercId]
            );
            gold -= 100
            await pool.query(`UPDATE users SET gold = $1 WHERE id = $2`,
                [gold, userId]
            );
        } else {
            return res.status(400).json({ message: "Not enough gold." });
        }
        res.status(200).json({
            status: "success",
            data: merc
        });
    } catch (err) {
        console.error("Error healing merc:", err);
        res.status(500).json({ message: "Failed to heal merc" });
    }
}

exports.fireMerc = async (req, res) => {
    const mercId = parseInt(req.params.id);
    try {
        await pool.query(`DELETE FROM mercs WHERE id = $1`,
            [mercId]
        );
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