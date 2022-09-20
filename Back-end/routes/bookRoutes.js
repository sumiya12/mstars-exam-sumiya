const express = require("express");
const router = express.Router();
const controller = require("../modules/index");

router.get("/get", controller.getall);
router.post("/create", controller.createbook);
router.put("/update", controller.update);
router.delete("/delete/:id", controller.deletes);
router.get("/getbyid/:id", controller.getById);

module.exports = router;
