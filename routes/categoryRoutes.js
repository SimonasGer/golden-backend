const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");

router.use(authController.protect); // padaro, kad visi routes butu apsaugoti nuo neprisijungusiu vartotoju
router
    .route("/")
    .get(authController.restrictTo("admin", "user"), categoryController.getAllCategories)
    .post(authController.restrictTo("admin",), categoryController.createCategory);

router
    .route("/:id")
    .delete(authController.restrictTo("admin"), categoryController.deleteCategory);

module.exports = router;