const router = require("express").Router();
const ctrl = require("../controllers/inventoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/", ctrl.getAll);
router.get("/alerts", ctrl.getAlerts);
router.get("/:id", ctrl.getById);
router.post("/", roleMiddleware("admin", "manager"), ctrl.create);
router.put("/:id", roleMiddleware("admin", "manager"), ctrl.update);
router.delete("/:id", roleMiddleware("admin"), ctrl.delete);

module.exports = router;
