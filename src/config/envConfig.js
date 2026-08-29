import dotenv from "dotenv";
dotenv.config();

const envConfig = {
  NODE_ENV: process.env.NODE_ENV || "development",
  NODE_PORT: process.env.NODE_PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || "",
};

export default envConfig;