const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const pool = require("../db");


const signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}

exports.getAllUsers = async (req, res) => {
    try {
        //later
    } catch (err) {
        console.log(err);
    }
};

exports.register = async (req, res) => {
    const { username, email, role, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({
            status: "failed",
            message: "Passwords do not match",
        });
    }
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert the user into the DB
        const result = await pool.query(
            `INSERT INTO users (username, email, role, password, gold)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username, email, role`,
            [username, email, role || 'user', hashedPassword, 2000]
        );

        const newUser = result.rows[0];

        // Create JWT
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        res.status(201).json({
            status: "success",
            data: newUser,
            token,
        });
    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            throw new Error("Please provide email and password");
        }

        // Get user from DB
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            throw new Error("Incorrect email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Incorrect email or password");
        }

        const token = signToken(user.id);

        res.status(200).json({
            status: "success",
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        //later
    } catch (err) {
        console.log(err);
    }
};

exports.resetSave = async (req, res) => {
    try {
        //later
    } catch (err) {
        console.error("Reset error:", err);
        res.status(500).json({ 
            status: "fail",
            message: "Failed to reset save." 
        });
    }
};


exports.updateUser = async (req, res) => {
    try{
        //later
    } catch (err) {
        res.status(404).json({
            status: "failed",
            message: err.message,
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        //later
    } catch (err) {
        console.log(err);
    }
};

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Get token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            throw new Error("User not authenticated");
        }

        // Decode token
        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );

        // Find user in DB
        const result = await pool.query(
            `SELECT id, username, email, role FROM users WHERE id = $1`,
            [decoded.id]
        );

        const currentUser = result.rows[0];

        if (!currentUser) {
            throw new Error("User does not exist");
        }

        // Attach user to request
        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({
            status: "failed",
            message: err.message,
        });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "failed",
                message: "You do not have permissions for this action",
            });
        } else {
            next();
        };
    }
};