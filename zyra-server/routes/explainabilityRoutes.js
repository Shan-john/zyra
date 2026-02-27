const router = require("express").Router();
const ctrl = require("../controllers/explainabilityController");
const authMiddleware = require("../middlewares/authMiddleware");

// Using auth middleware so we know who is requesting explanations
router.use(authMiddleware);

router.post("/decision", ctrl.explainDecision);

module.exports = router;
