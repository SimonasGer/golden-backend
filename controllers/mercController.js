const Merc = require("../models/mercModel");
const User = require("../models/userModel");
// ROUTE FUNCTIONS
exports.getAllMercs = async (req, res) => {
    try {
    // Filtering:
        const queryObject = { ...req.query };
        const excludedFields = ["sort", "limit", "fields"];
        excludedFields.forEach((element) => delete queryObject[element]);

        // Advanced filtering:
        let queryString = JSON.stringify(queryObject);
        queryString = queryString.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}` // query rasyti reikia taip: http://localhost:3000/api/v1/hotels?comfort[gte]=5
        );
        // console.log(JSON.parse(queryString));

        let query = Merc.find(JSON.parse(queryString));

        // Sorting:
    if (req.query.sort){
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy); // http://localhost:3000/api/v1/hotels?comfort[gte]=6&sort=-price
    } else {
        query = query.sort("-created_at"); // http://localhost:3000/api/v1/hotels?comfort[gte]=6&sort
    }

    // Field limiting:
    if (req.query.fields){
        const fields = req.query.fields.split(",").join(" ");
        query = query.select(fields); // http://localhost:3000/api/v1/hotels?fields=name,address
    }

    // Execute query
    const mercs = await query;
    res.status(200).json({
        status: "success",
        results: mercs.length,
        data: {
            mercs,
        },
    });
    } catch (err) {
        console.log(err);
    }
};

exports.createMerc = async (req, res) => {
    try {
        const newMerc = await Merc.create(req.body);

        const creator = await User.findById(req.body.creator);

        creator.mercs.push(newMerc._id);
        await creator.save();
        
        res.status(201).json({
            status: "success",
            data: {
                post: newMerc,
            },
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getMercById = async (req, res) => {
    try {
        const merc = await Merc.findById(req.params.id)
        if (!merc) {
            res.status(404).json({
                status: "failed",
                message: "invalid id",
            });
        } else {
            res.status(200).json({
                status: "success",
                data: {
                    merc,
                },
            });
        }
    } catch (err) {
        console.log(err);
    }
};

// kitam kartui
exports.updateMerc = async (req, res) => {
    try{
        const merc = await Merc.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: "success",
            data: {
                merc,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: "failed",
            message: err.message,
        });
    }
};

exports.deleteMerc = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status: "success",
            data: {
                post: "deleted",
            },
        });
    } catch (err) {
        console.log(err);
    }
};