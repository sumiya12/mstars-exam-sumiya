import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { assertRequiredEnv, env } from "./config/env.js";

const startServer = async () => {
  assertRequiredEnv();
  await connectDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Express server started at Port ${env.port}`);
  });
};

startServer()
  .then(() => {
    console.log("Connected to the MongoDB");
  })
  .catch((error: Error) => {
    console.error("Server startup error:", error.message);
    process.exitCode = 1;
  });
