import express from "express";
import {
  DBController,
  StatusController,
  MappingController,
  BatchMappingController,
} from "../controllers/index";

const router = express.Router();

router.get("/", StatusController);
router.get("/db", DBController);
router.post("/mapping", MappingController);
router.post("/batch", BatchMappingController);
export default router;
