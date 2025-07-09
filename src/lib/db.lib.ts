import mssql from 'mssql';
import { env } from '../config/env.config';

let _pool: mssql.ConnectionPool | null = null;
const isProduction = env.APP_ENV === 'production';

export async function getDbPool(): Promise<mssql.ConnectionPool> {
  if (_pool && _pool.connected) {
    return _pool;
  }

  _pool = await mssql.connect({
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    server: env.DB_HOST,
    database: env.DB_NAME,
    port: env.DB_PORT,
    options: { encrypt: isProduction, trustServerCertificate: !isProduction },
  });

  return _pool;
}
