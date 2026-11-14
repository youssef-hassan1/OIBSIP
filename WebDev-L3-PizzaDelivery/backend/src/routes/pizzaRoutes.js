import express from "express";
import { getAllPizzas,
         getPizzaById,
         createPizza,
         updatePizza,
         deletePizza,
 } from "../controllers/pizzaController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllPizzas);
router.get("/:id", getPizzaById);
router.post("/",protect, adminOnly, createPizza);
router.put("/:id", protect, adminOnly, updatePizza);
router.delete("/:id", protect, adminOnly, deletePizza);

export default router;