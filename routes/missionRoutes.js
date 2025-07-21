const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const authController = require("../controllers/authController");

router.use(authController.protect)
router
    .route("/")
    .get(authController.restrictTo("user", "admin"), missionController.createMission)

module.exports = router;