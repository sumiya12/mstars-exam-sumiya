import cors from "cors";
import express from "express";
import routes from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/", routes);

  return app;
};
