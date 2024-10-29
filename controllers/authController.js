const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            status: "success",
            results: users.length,
            data: {
                users,
            },
        });
    } catch (err) {
        console.log(err);
    }
};

exports.register = async (req, res) => {
    try {
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            role: req.body.role,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
        });
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
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
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new Error("Please provide email and password");
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.correctPassword(password, user.password))) {
            throw new Error("Incorrect password or email");
        }
        const token = signToken(user.id);
        res.status(201).json({
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: token,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message,
        })
    }
}

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("posts").populate("comments").populate("likes"); // populate, kad sudeti users is duomenu bazes
        if (!user) {
            res.status(404).json({
                status: "failed",
                message: "invalid id",
            });
        } else {
            res.status(200).json({
                status: "success",
                data: {
                    user,
                },
            });
        }
    } catch (err) {
        console.log(err);
    }
};

exports.updateUser = async (req, res) => {
    try{
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: "success",
            data: {
                user,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: "failed",
            message: err.message,
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status: "success",
            data: {
                user: "deleted",
            },
        });
    } catch (err) {
        console.log(err);
    }
};

exports.protect = async (req, res, next) => {
    try {
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token){
            throw new Error("User not authenticated");
        }
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            throw new Error("User does not exist");
        }
        req.user = currentUser;
        next();
    } catch (err) {
        res.status(400).json({
            status: "failed",
            error: err.message,
        })
    }
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "failed",
                message: "You do not have permissions for this action",
            });
        } else {
            next();
        }
    }
}