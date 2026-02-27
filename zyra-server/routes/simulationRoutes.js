const router = require("express").Router();
const ctrl = require("../controllers/simulationController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.post("/run", roleMiddleware("admin", "manager"), ctrl.run);
router.get("/results/:scenarioId", ctrl.getResult);
router.get("/scenarios", ctrl.listScenarios);

module.exports = router;
