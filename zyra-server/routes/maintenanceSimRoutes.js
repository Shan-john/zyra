const router = require("express").Router();
const ctrl = require("../controllers/maintenanceSimController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.post("/simulate", roleMiddleware("admin", "manager"), ctrl.runSimulation);

module.exports = router;
