const router = require("express").Router();
const ctrl = require("../controllers/productionController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/schedules", ctrl.getSchedules);
router.post("/schedules", roleMiddleware("admin", "manager"), ctrl.createSchedule);
router.get("/work-orders", ctrl.getWorkOrders);
router.post("/work-orders", roleMiddleware("admin", "manager"), ctrl.createWorkOrder);
router.put("/work-orders/:id/status", roleMiddleware("admin", "manager", "operator"), ctrl.updateWorkOrderStatus);
router.get("/bom/:productId", ctrl.getBom);

module.exports = router;
