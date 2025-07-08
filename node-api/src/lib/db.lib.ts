import { env } from "config/env.config";
import mssql from "mssql";

const isProduction = env.APP_ENV === "production";

const pool = new mssql.ConnectionPool({
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  server: env.DB_HOST,
  database: env.DB_NAME,
  options: {
    encrypt: isProduction,
    trustServerCertificate: !isProduction,
  },
});

export default pool;