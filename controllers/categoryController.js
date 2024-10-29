const Category = require("../models/categoryModel");

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            status: "success",
            results: categories.length,
            data: {
                categories,
            },
        });
    } catch (err) {
        console.log(err);
    }
};

exports.createCategory = async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                category: newCategory,
            },
        });
    } catch (err) {
        console.log(err);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status: "success",
            data: {
                category: "deleted",
            },
        });
    } catch (err) {
        console.log(err);
    }
};