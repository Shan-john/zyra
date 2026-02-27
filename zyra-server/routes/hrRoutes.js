const router = require("express").Router();
const ctrl = require("../controllers/hrController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/employees", ctrl.getEmployees);
router.post("/employees", roleMiddleware("admin", "manager"), ctrl.addEmployee);
router.get("/attendance", ctrl.getAttendance);
router.post("/attendance", ctrl.clockInOut);
router.get("/payroll", roleMiddleware("admin", "manager"), ctrl.getPayroll);

module.exports = router;
