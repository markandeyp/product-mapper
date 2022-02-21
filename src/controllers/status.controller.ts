import { Request, Response } from "express";
import { ServerConfig } from "../config";

export function StatusController(_: Request, res: Response) {
  res.send({
    status: `API is running @ ${ServerConfig.host}:${ServerConfig.port}`,
  });
}
