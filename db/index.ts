import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 使用环境变量中的数据库连接URL
const connectionString = process.env.DATABASE_URL || '';

// 创建Postgres客户端
const client = postgres(connectionString);

// 初始化Drizzle ORM
export const db = drizzle(client, { schema });

// 导出所有schema
export * from './schema'; 