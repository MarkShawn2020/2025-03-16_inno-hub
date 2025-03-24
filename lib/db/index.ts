import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { config } from 'dotenv';

// 加载环境变量
config();


const DATABASE_URL = process.env.POSTGRES_URL;
console.log('DATABASE_URL: ', DATABASE_URL);

if (!DATABASE_URL) {
  throw new Error('POSTGRES_URL is not set');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool, { schema }); 