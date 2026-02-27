const router = require("express").Router();
const ctrl = require("../controllers/aiController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

// ─── AI Explainability (Gemini) ──────────
router.post("/explain", ctrl.explain);
router.get("/explanations/:id", ctrl.getCached);
router.post("/summarize", ctrl.summarize);

// ─── ML Predictions (FastAPI proxy) ──────
router.post("/ml/predict/failure", ctrl.predictFailure);
router.get("/ml/health", ctrl.mlHealth);

module.exports = router;
