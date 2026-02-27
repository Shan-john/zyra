const router = require("express").Router();
const ctrl = require("../controllers/salesController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/orders", ctrl.getOrders);
router.post("/orders", roleMiddleware("admin", "manager"), ctrl.createOrder);
router.get("/invoices", ctrl.getInvoices);
router.post("/invoices", roleMiddleware("admin", "manager"), ctrl.generateInvoice);
router.get("/forecast", ctrl.getForecast);

module.exports = router;
