import dotenv from "dotenv";
import path from "path";

// dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });


export default {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/bingo",
    jwtSecret: process.env.JWT_SECRET || "secret",
    frontendUrl: process.env.FRONTEND_URL,
    prefix: process.env.PREFIX || "",
};