const pool = require("../db");
const { generateMultipleMercs } = require("../logic/generateMerc");

exports.getHiredMercs = async (req, res) => {
    try {
        const userId = req.user.id; // comes from JWT
        const mercsResult = await pool.query(`SELECT * FROM mercs WHERE boss = $1`,
            [userId]
        );
        const goldResult = await pool.query(`SELECT gold FROM users WHERE id = $1`,
            [userId]
        );

        const mercs = mercsResult.rows;
        const gold = goldResult.rows[0].gold;
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

exports.createMercs = async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 1;
        const userId = req.user.id; // comes from JWT
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
    try {
        const userId = req.user.id; // comes from JWT
        const merc = req.body;
        if (!merc) {
            return res.status(400).json({ message: "Missing merc data" });
        }
        const goldResult = await pool.query(`SELECT gold FROM users WHERE id = $1`,
            [userId]
        )
        let gold = goldResult.rows[0].gold
        if (gold < merc.price) {
            return res.status(403).json(
                { message: "Not enough gold to hire this merc" }
            );
        }
        const client = await pool.connect();
        await client.query("BEGIN");
        try {
            gold -= merc.price;
            await client.query(`UPDATE users SET gold = $1 WHERE id = $2`,
                [gold, userId]
            )
            await client.query(`INSERT INTO mercs
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
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Error hiring merc:", err);
            res.status(500).json({ message: "Failed to hire merc" });
        } finally {
            client.release();
        }
        res.status(201).json({
            status: "success",
        });
    } catch (err) {
        console.error("Error hiring merc:", err);
        res.status(500).json({ message: "Failed to hire merc" });
    }
};

exports.healMerc = async (req, res) => {
    try {
        const userId = req.user.id; // comes from JWT
        const mercId = parseInt(req.params.id);
        const result = await pool.query(`SELECT gold FROM users WHERE id = $1`,
            [userId]
        );
        let gold = result.rows[0].gold;
        if (gold > 100) {
            const client = await pool.connect();
            client.query("BEGIN")
            try {
                await client.query(`UPDATE mercs SET injury_status = 'healthy' WHERE id = $1`,
                [mercId]
                );
                gold -= 100;
                await client.query(`UPDATE users SET gold = $1 WHERE id = $2`,
                    [gold, userId]
                );
                client.query("COMMIT");
            } catch (error) {
                client.query("ROLLBACK");
            } finally {
                client.release();
            }
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

exports.deleteMerc = async (req, res) => {
    try {
        const mercId = parseInt(req.params.id);
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