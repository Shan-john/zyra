const router = require("express").Router();
const ctrl = require("../controllers/optimizationController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.post("/run", roleMiddleware("admin", "manager"), ctrl.run);
router.get("/results/:runId", ctrl.getResult);
router.get("/history", ctrl.getHistory);

module.exports = router;
