const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const authController = require("../controllers/authController");

router.use(authController.protect)
router
    .route("/")
    .get(authController.restrictTo("user", "admin"), missionController.generateNewMissions)
    .post(authController.restrictTo("user", "admin"), missionController.acceptMission)
router
    .route("/accepted")
    .get(authController.restrictTo("user", "admin"), missionController.getAllAcceptedMissions)
router
    .route("/log")
    .get(authController.restrictTo("user", "admin"), missionController.getAllPastMissionsByUser)
router
    .route("/:id")
    .get(authController.restrictTo("user", "admin"), missionController.getMissionById)
    .patch(authController.restrictTo("user", "admin"), missionController.startMission)
    .delete(authController.restrictTo("user", "admin"), missionController.deleteMissionFromLogs)

module.exports = router;