import { config } from "dotenv";
config();

import express from "express";
import cors from "cors";
import router from "./routes";
import { ServerConfig } from "./config";

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(ServerConfig.port, () => {
  console.log(`Server is running @ ${ServerConfig.host}:${ServerConfig.port}`);
});
