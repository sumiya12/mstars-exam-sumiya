import express, { json } from "express";
import { config } from "dotenv";
import { set, connect } from "mongoose";
import routes from "./routes/index.js"; // Add the .js extension here
import cors from "cors";


config();

const app = express();
app.use(cors());
app.use(json());
app.use("/", routes);

// Set strictQuery option before connecting to MongoDB
set('strictQuery', true); // or false, depending on your needs

const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set
const ATLAS_MONGO_CONNECTION = process.env.ATLAS_MONGO_CONNECTION;

// Connect to MongoDB and start the server
connect(ATLAS_MONGO_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to the MongoDB");
  app.listen(PORT, () => {
    console.log("Express server started at Port " + PORT);
  });
})
.catch((error) => {
  console.error("MongoDB connection error:", error.message);
});
