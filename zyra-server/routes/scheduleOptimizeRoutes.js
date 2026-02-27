const router = require("express").Router();
const ctrl = require("../controllers/scheduleOptimizeController");

// No auth required — this is a real-time dashboard endpoint
router.post("/optimize", ctrl.optimize);

module.exports = router;
