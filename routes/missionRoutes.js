const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const authController = require("../controllers/authController");

router.use(authController.protect)
router
    .route("/")
    .get(authController.restrictTo("user", "admin"), missionController.generateMission)
    .post(authController.restrictTo("user", "admin"), missionController.acceptMission)
router
    .route("/accepted")
    .get(authController.restrictTo("user", "admin"), missionController.getAllMissions)
router
    .route("/log")
    .get(authController.restrictTo("user", "admin"), missionController.getAllMissionsByUser)
router
    .route("/:id")
    .get(authController.restrictTo("user", "admin"), missionController.getMissionById)
    .patch(authController.restrictTo("user", "admin"), missionController.updateMissionStatus)
    .delete(authController.restrictTo("user", "admin"), missionController.deleteMission)

module.exports = router;