const router = require("express").Router();
const ctrl = require("../controllers/schedulingController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.post("/optimize", roleMiddleware("admin", "manager"), ctrl.optimize);

module.exports = router;
