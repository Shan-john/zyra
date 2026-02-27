const router = require("express").Router();
const ctrl = require("../controllers/financeController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/ledger", ctrl.getLedger);
router.post("/ledger", roleMiddleware("admin", "manager"), ctrl.createEntry);
router.get("/pnl", ctrl.getPnL);
router.get("/cashflow", ctrl.getCashFlow);

module.exports = router;
