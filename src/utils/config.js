import dotenv from "dotenv";

dotenv.config();
const config = {
  DB_URI: process.env.DB_URI,
  FILL_STRING: process.env.FILL_STRING,
  RESET_SALT: process.env.RESET_SALT,

  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,

  JWT_SECRET: process.env.JWT_SECRET,
};

export default config;
