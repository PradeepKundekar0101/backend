import express from "express";
import dotenv from "dotenv";
import { mongoConnect } from "./services/mongo.connect";

// Routes:
import activityRoutes from "./routes/activity";
import categoryRoutes from "./routes/category";
import globalErrorHandler from "./controllers/error";
import { errorInterceptor } from "./middlewares/logger";

dotenv.config();

// Connect to MongoDB:
mongoConnect(process.env.MONGO_URI!);

// App config:
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes:
app.use("/api/v1/activities", activityRoutes);
app.use("/api/v1/category", categoryRoutes);

// Default route:
app.get("/", (req, res) => {
  res.send("Second Shorts API");
});

// Global Error Handler:
app.use(errorInterceptor);
app.use(globalErrorHandler);

// Port:
const PORT = process.env.PORT || 3000;

// Listen:
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
