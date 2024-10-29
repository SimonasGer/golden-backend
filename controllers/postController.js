const Post = require("../models/postModel");
const User = require("../models/userModel");
// ROUTE FUNCTIONS
exports.getAllPosts = async (req, res) => {
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

        let query = Post.find(JSON.parse(queryString));

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
    const posts = await query;
    res.status(200).json({
        status: "success",
        results: posts.length,
        data: {
            posts,
        },
    });
    } catch (err) {
        console.log(err);
    }
};

exports.createPost = async (req, res) => {
    try {
        const newPost = await Post.create(req.body);

        const creator = await User.findById(req.body.creator);

        creator.posts.push(newPost._id);
        await creator.save();
        
        res.status(201).json({
            status: "success",
            data: {
                post: newPost,
            },
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("likes").populate("creator").populate("category"); // populate, kad sudeti users is duomenu bazes
        if (!post) {
            res.status(404).json({
                status: "failed",
                message: "invalid id",
            });
        } else {
            res.status(200).json({
                status: "success",
                data: {
                    post,
                },
            });
        }
    } catch (err) {
        console.log(err);
    }
};

// kitam kartui
exports.updatePost = async (req, res) => {
    try{
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        post.likes.push(req.body.likes)
        res.status(200).json({
            status: "success",
            data: {
                post,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: "failed",
            message: err.message,
        });
    }
};

exports.updateLikes = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                status: "failed",
                message: "Dish not found",
            });
        }
        const user = await User.findById(req.body.likes);
        const existingLikeIndex = post.likes.indexOf(req.body.likes);
        const existingUserIndex = user.likes.indexOf(req.params.id);

        if (existingLikeIndex === -1) {
            // Item does not exist, so add it
            post.likes.push(req.body.likes);
            user.likes.push(req.params.id)
        } else {
            // Item exists, so remove it
            post.likes.splice(existingLikeIndex, 1);
            user.likes.splice(existingUserIndex, 1);
        }

        await post.save();
        await user.save();

        res.status(200).json({
            status: "success",
            data: {
                post,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: "failed",
            message: err.message,
        });
    }
};

exports.deletePost = async (req, res) => {
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