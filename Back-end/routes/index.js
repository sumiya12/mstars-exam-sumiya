const express = require("express");
const router = express.Router();
const routes = require("./bookRoutes");

router.use("/book", routes);

module.exports = router;
