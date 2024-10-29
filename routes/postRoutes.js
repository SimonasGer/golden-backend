const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authController = require("../controllers/authController");

router.use(authController.protect); // padaro, kad visi routes butu apsaugoti nuo neprisijungusiu vartotoju
router
    .route("/")
    .get(authController.restrictTo("user", "admin"), postController.getAllPosts)
    .post(authController.restrictTo("admin", "user"), postController.createPost);

router
    .route("/:id")
    .get(authController.restrictTo("user", "admin"), postController.getPostById)
    .post(authController.restrictTo("user", "admin"), postController.updateLikes)
    .delete(authController.restrictTo("user", "admin"), postController.deletePost)

router
    .route("/update/:id")
    .post(authController.restrictTo("admin", "user"), postController.updatePost)


module.exports = router;