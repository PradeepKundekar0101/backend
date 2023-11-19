"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongo_connect_1 = require("./utils/mongo.connect");
dotenv_1.default.config();
// Connect to MongoDB:
(0, mongo_connect_1.mongoConnect)();
// App config:
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Routes:
// Default route:
app.get("/", (req, res) => {
    res.send("Second Shorts API");
});
// Port:
const PORT = process.env.PORT || 3000;
// Listen:
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
