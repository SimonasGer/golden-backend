const Comment = require("../models/commentModel");
const User = require("../models/userModel");
const Post = require("../models/postModel");

// ROUTE FUNCTIONS
exports.getComments = async (req, res) => {
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

        let query = Comment.find(JSON.parse(queryString));

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

    const comments = await query;
    res.status(200).json({
        status: "success",
        results: comments.length,
        data: {
            comments,
        },
    });
    } catch (err) {
        console.log(err);
    }
};

exports.createComment = async (req, res) => {
    try {
        const newComment = await Comment.create(req.body);
        const creator = await User.findById(req.body.creator);

        creator.comments.push(newComment._id);
        await creator.save();
        if(req.body.post){
            const post = await Post.findById(req.body.post);
            post.comments.push(newComment._id);
            await post.save();
        } else if (req.body.comment){
            const parent = await Comment.findById(req.body.comment);
            parent.comments.push(newComment._id);
            await parent.save();
        }

        res.status(201).json({
            status: "success",
            data: {
                comment: newComment,
            },
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id).populate("likes").populate("creator"); // populate, kad sudeti users is duomenu bazes
        if (!comment) {
            res.status(404).json({
                status: "failed",
                message: "invalid id",
            });
        } else {
            res.status(200).json({
                status: "success",
                data: {
                    comment,
                },
            });
        }
    } catch (err) {
        console.log(err);
    }
};

// kitam kartui
exports.updateComment = async (req, res) => {
    try{
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        comment.likes.push(req.body.likes)
        res.status(200).json({
            status: "success",
            data: {
                comment,
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
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({
                status: "failed",
                message: "Dish not found",
            });
        }
        
        const existingLikeIndex = comment.likes.indexOf(req.body.likes);

        if (existingLikeIndex === -1) {
            // Item does not exist, so add it
            comment.likes.push(req.body.likes);
        } else {
            // Item exists, so remove it
            comment.likes.splice(existingLikeIndex, 1);
        }

        await comment.save();

        res.status(200).json({
            status: "success",
            data: {
                comment,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: "failed",
            message: err.message,
        });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        // Find the comment by ID
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Comment not found'
            });
        }

        // Get references to creator, post, and parent comment
        const creator = await User.findById(req.body.creator._id);
        const post = await Post.findById(req.body.post);
        const origin = await Comment.findById(req.body.comment);

        // Check if the comment has replies
        if (comment.comments.length > 0) {
            // Mark the comment as [removed]
            comment.content = "[removed]";
            await comment.save(); // Save the updated comment

            // No need to remove the comment from the post since it's just marked
            // return success response
            return res.status(200).json({
                status: "success",
                message: "Comment marked as removed successfully",
            });
        } else {
            // If the comment has no replies, delete it
            await Comment.findByIdAndDelete(req.params.id);
            // Only now, remove the comment reference from the post's comments
            if (post) {
                const postIndex = post.comments.indexOf(req.params.id);
                if (postIndex > -1) {
                    post.comments.splice(postIndex, 1);
                    await post.save(); // Save the post after removing the comment
                }
            }
        }

        // Remove the comment reference from the creator's comments
        if (creator) {
            const creatorIndex = creator.comments.indexOf(req.params.id);
            if (creatorIndex > -1) {
                creator.comments.splice(creatorIndex, 1);
                await creator.save(); // Save the creator after removing the comment reference
            }
        }

        // Remove the comment reference from the parent comment (if it's a reply)
        if (origin) {
            const originIndex = origin.comments.indexOf(req.params.id);
            if (originIndex > -1) {
                origin.comments.splice(originIndex, 1);
                await origin.save(); // Save the origin comment after removing the reference
            }
        }

        // Return success response
        res.status(200).json({
            status: "success",
            message: "Comment processed successfully",
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Something went wrong",
        });
    }
};
