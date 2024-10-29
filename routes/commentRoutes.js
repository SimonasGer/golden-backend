const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authController = require("../controllers/authController");

router.use(authController.protect); // padaro, kad visi routes butu apsaugoti nuo neprisijungusiu vartotoju
router
    .route("/")
    .post(authController.restrictTo("admin", "user"), commentController.createComment);

router
    .route("/:id")
    .get(authController.restrictTo("user", "admin"), commentController.getCommentById)
    .post(authController.restrictTo("user", "admin"), commentController.updateLikes)

router
    .route("/update/:id")
    .post(authController.restrictTo("admin", "user"), commentController.updateComment)

router
    .route("/delete/:id")
    .post(authController.restrictTo("user", "admin"), commentController.deleteComment)


module.exports = router;