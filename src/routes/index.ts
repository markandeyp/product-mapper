import express from "express";
import {
  DBController,
  StatusController,
  MappingController,
} from "../controllers/index";

const router = express.Router();

router.get("/", StatusController);
router.get("/db", DBController);
router.post("/mapping", MappingController);
export default router;
