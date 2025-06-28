const express = require("express");
const router = express.Router();

router.use("/users", require("./user.routes.js"));
router.use("/expense", require("./expense.routes.js"));
router.use("/categories", require("./category.routes.js"));
router.use("/budget", require("./budget.routes.js"));
router.use("/report", require("./report.routes.js"));

module.exports = router;
