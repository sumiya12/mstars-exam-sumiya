import cors from "cors";
import express from "express";
import calendlyRoutes from "./routes/calendly.routes.js";
import routes from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/calendly", calendlyRoutes);
  app.use("/", routes);

  return app;
};
