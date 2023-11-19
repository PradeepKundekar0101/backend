import express from "express";
import dotenv from "dotenv";
import { mongoConnect } from "./utils/mongo.connect";

dotenv.config();

// Connect to MongoDB:
mongoConnect(process.env.MONGO_URI!);

// App config:
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes:

// Default route:
app.get("/", (req, res) => {
  res.send("Second Shorts API");
});

// Port:
const PORT = process.env.PORT || 3000;

// Listen:
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
