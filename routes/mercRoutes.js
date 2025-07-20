const express = require("express");
const router = express.Router();
const mercController = require("../controllers/mercController");
const authController = require("../controllers/authController");

//router.use(authController.protect); // padaro, kad visi routes butu apsaugoti nuo neprisijungusiu vartotoju
router
    .route("/")
    .get(mercController.getAllMercs)
    .post(mercController.createMerc);

router
    .route("/:id")
    .get(authController.restrictTo("user", "admin"), mercController.getMercById)
    .delete(authController.restrictTo("user", "admin"), mercController.deleteMerc)

router
    .route("/update/:id")
    .post(authController.restrictTo("admin", "user"), mercController.updateMerc)


module.exports = router;