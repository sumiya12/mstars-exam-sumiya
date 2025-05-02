import express from "express";
const router = express.Router();
import bookRoutes from "./bookRoutes.js";
import routesWarehouse from "./wareHouseRoutes.js";
import routesCanvas from "./canvasRoute.js";
import routeslogin from "./authRoutes.js";
import routesGift from "./giftCardRoutes.js";
import routestime from "./timeLog.js";

router.use("/book", bookRoutes);
router.use("/warehouse", routesWarehouse);
router.use("/canvas", routesCanvas);
router.use("/login", routeslogin);
router.use("/giftcard", routesGift);
router.use("/time", routestime);

export default router;
