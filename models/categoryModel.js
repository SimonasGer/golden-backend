const mongoose = require("mongoose");
const { type } = require("os");
const categorySchema = new mongoose.Schema({
    category: { 
        type: String,
        required: true
    }
})


const Category = mongoose.model("Category", categorySchema);
module.exports = Category;