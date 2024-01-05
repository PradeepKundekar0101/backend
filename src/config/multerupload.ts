import multer = require("multer");
const storage = multer.memoryStorage();
export const upload = multer({storage});
