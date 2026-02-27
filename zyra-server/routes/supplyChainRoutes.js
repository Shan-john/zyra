const router = require("express").Router();
const ctrl = require("../controllers/supplyChainController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/suppliers", ctrl.getSuppliers);
router.post("/suppliers", roleMiddleware("admin", "manager"), ctrl.addSupplier);
router.get("/purchase-orders", ctrl.getPurchaseOrders);
router.post("/purchase-orders", roleMiddleware("admin", "manager"), ctrl.createPurchaseOrder);
router.put("/purchase-orders/:id/receive", roleMiddleware("admin", "manager", "operator"), ctrl.receiveOrder);

module.exports = router;
