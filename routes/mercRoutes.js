const express = require("express");
const router = express.Router();
const mercController = require("../controllers/mercController");
const authController = require("../controllers/authController");

router.use(authController.protect)
router
    .route("/")
    .get(authController.restrictTo("user", "admin"), mercController.getHiredMercs)
    .post(authController.restrictTo("user", "admin"), mercController.createMerc)

router
    .route("/hire")
    .post(authController.restrictTo("user", "admin"), mercController.hireMerc)

router
    .route("/:id")
    .delete(authController.restrictTo("user", "admin"), mercController.fireMerc)


module.exports = router;