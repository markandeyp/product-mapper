import { Request, Response } from "express";
import BatchService from "../service/batch.service";

export async function BatchMappingController(req: Request, res: Response) {
  let { size } = req.body;
  const batchService = new BatchService();
  if (!size) {
    size = 5;
  } else {
    const results = await batchService.mapIngredients(size);
    res.send({ status: "OK", results });
  }
}
