import DBDetails from "../models/DBDetails";

export const DBConfig: DBDetails = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
};
