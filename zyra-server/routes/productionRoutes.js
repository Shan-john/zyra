const router = require("express").Router();
const ctrl = require("../controllers/productionController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/schedules", ctrl.getSchedules);
router.post("/schedules", roleMiddleware("admin", "manager"), ctrl.createSchedule);

// Machines (NEW)
router.get("/machines", ctrl.getMachines);
router.post("/machines", roleMiddleware("admin", "manager"), ctrl.createMachine);
router.put("/machines/:id", roleMiddleware("admin", "manager"), ctrl.updateMachine);
router.delete("/machines/:id", roleMiddleware("admin", "manager"), ctrl.deleteMachine);

// Work Orders (UPDATED)
router.get("/work-orders", ctrl.getWorkOrders);
router.post("/work-orders", roleMiddleware("admin", "manager"), ctrl.createWorkOrder);
router.put("/work-orders/:id", roleMiddleware("admin", "manager", "operator"), ctrl.updateWorkOrder);
router.delete("/work-orders/:id", roleMiddleware("admin", "manager"), ctrl.deleteWorkOrder);

router.get("/bom/:productId", ctrl.getBom);

module.exports = router;
