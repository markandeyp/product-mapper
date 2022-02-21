import { Request, Response } from "express";
import MappingService from "../service/mapping.service";

export async function MappingController(req: Request, res: Response) {
  const { ingredient, quantity, unit } = req.body;
  const mappingService = new MappingService();
  if (!ingredient || !quantity || !unit) {
    res.status(400).send({
      status: "Bad Request",
      error: "Missing ingredientName/quantity/unit",
    });
  } else {
    const results = await mappingService.getProductMapping(
      ingredient,
      quantity,
      unit
    );
    res.send({ status: "OK", results });
  }
}
