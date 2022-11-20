import { Request, Response } from "express";
import { getProductType } from "../helpers/type";
import Product from "../models/Product";
import DBService from "../service/db.service";
import { DBConfig } from "../config";

export async function DBController(_: Request, res: Response) {
  const dbService = new DBService(DBConfig);

  try {
    const connected = await dbService.connect();
    if (connected) {
      const type: Product = getProductType();
      const results = await dbService.query(
        "SELECT top 10 * FROM WalmartProduct",
        type
      );
      res.status(200).send({ status: "success", results });
    }
  } catch (err) {
    res.status(500).send({ status: "failed", err });
  }
}
