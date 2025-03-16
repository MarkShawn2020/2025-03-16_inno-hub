import { compare, hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * 对密码进行哈希处理
 * 此函数应仅在服务器端运行，不应在Edge Runtime中使用
 */
export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

/**
 * 比较明文密码与哈希密码
 * 此函数应仅在服务器端运行，不应在Edge Runtime中使用
 */
export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
} 