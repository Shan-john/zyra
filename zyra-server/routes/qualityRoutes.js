const router = require("express").Router();
const ctrl = require("../controllers/qualityController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/inspections", ctrl.getInspections);
router.post("/inspections", roleMiddleware("admin", "manager", "operator"), ctrl.logInspection);
router.get("/defects", ctrl.getDefects);

module.exports = router;
