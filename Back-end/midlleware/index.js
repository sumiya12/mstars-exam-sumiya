import { errorHandler } from "./errorHandler.js";
import  authMiddleware  from "./authMiddleware.js";

app.use(authMiddleware);
app.use(errorHandler);