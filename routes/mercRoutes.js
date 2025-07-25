const express = require("express");
const router = express.Router();
const mercController = require("../controllers/mercController");
const authController = require("../controllers/authController");

router.use(authController.protect)
router
    .route("/")
    .get(authController.restrictTo("user", "admin"), mercController.getHiredMercs)
    .post(authController.restrictTo("user", "admin"), mercController.createMercs)

router
    .route("/hire")
    .post(authController.restrictTo("user", "admin"), mercController.hireMerc)

router
    .route("/:id")
    .patch(authController.restrictTo("user", "admin"), mercController.healMerc)
    .delete(authController.restrictTo("user", "admin"), mercController.deleteMerc)


module.exports = router;