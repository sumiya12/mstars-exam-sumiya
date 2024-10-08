import pkg from 'express';
const { Router } = pkg;
const router = Router();
import {
    getAllBooks, createBook,
    getAllCanvas,
    getByPhoto, getByCardType,
    getBookById, deleteBook,
    getByAccountType, updateBook,
    getByCashType,
} from "../controllers/controller.js"; // Adjust as necessary


router.get("/get", getAllBooks);
router.get("/getbycanvas", getAllCanvas);
router.get("/getbyphoto", getByPhoto);
router.get("/getbycardtype", getByCardType);
router.get("/getbycashtype", getByCashType);
router.get("/getbyaccounttype", getByAccountType);
router.post("/create", createBook);
router.put("/update", updateBook);
router.delete("/delete/:id", deleteBook);
router.get("/getbyid/:id", getBookById);
// router.get("/getbyday/:date", getByDay);

export default router;
