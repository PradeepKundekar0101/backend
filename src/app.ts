import express, { response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { mongoConnect } from "./services/mongo.connect";

// Routes:
import tagRoutes from "./routes/tag";
import categoryRoutes from "./routes/category";
import analyticsRoutes from "./routes/analytics";
import productRoutes from "./routes/product";
import videoRoutes from "./routes/video";
import helpdeskRoutes from "./routes/helpdesk";

import globalErrorHandler from "./controllers/error";
import { errorInterceptor, responseInterceptor } from "./middlewares/logger";
import path from "path";

dotenv.config();
console.log(process.env.MONGO_URI)
// Connect to MongoDB:
mongoConnect(process.env.MONGO_URI!);

// App config:
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS:
app.use(
  cors({
    origin: "*",
  })
);

// Routes:
app.use(responseInterceptor);
app.use("/api/v1/tag", tagRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/video", videoRoutes);
app.use("/api/v1/helpdesk", helpdeskRoutes);
app.use("/api/v1/video", videoRoutes);

// Default route:
app.get("/", (req, res) => {
  res.send("Second Shorts API");
});

// Access Error logs:
app.get("/error-logs", (req, res) => {
  console.log(
    "Error logs accessed",
    path.join(__dirname, "../logs/error/error.log")
  );
  res.sendFile(path.join(__dirname, "../logs/error/error.log"));
});

// Unhandled Routes:
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

// Global Error Handler:
app.use(errorInterceptor);
app.use(globalErrorHandler);

// Uncaught Exception:
process.on("uncaughtException", (err: any) => {
  console.log("Uncaught Exception, shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// Port:
const PORT = process.env.PORT || 3000;

// Listen:
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

// Unhandled Rejection:
process.on("unhandledRejection", (err: any) => {
  console.log("Unhandled Rejection, shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
