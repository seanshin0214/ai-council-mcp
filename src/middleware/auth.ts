import { Context, Next } from 'hono';
import { pool } from '../db.js';

// 사용자 역할 타입
export type Role = 'reader' | 'writer' | 'admin';

// API 키 검증
export async function authenticateAPIKey(c: Context, next: Next) {
  const apiKey = c.req.header('X-API-Key');

  if (!apiKey) {
    return c.json(
      {
        error: 'Missing API key',
        message: 'Please provide X-API-Key header',
      },
      401
    );
  }

  try {
    // 데이터베이스에서 사용자 조회
    const result = await pool.query(
      'SELECT id, username, role FROM users WHERE api_key = $1',
      [apiKey]
    );

    if (result.rows.length === 0) {
      return c.json(
        {
          error: 'Invalid API key',
          message: 'The provided API key is not valid',
        },
        401
      );
    }

    // 컨텍스트에 사용자 정보 저장
    const user = result.rows[0];
    c.set('user', user);

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json(
      {
        error: 'Authentication failed',
        message: 'Internal server error',
      },
      500
    );
  }
}

// 역할 기반 접근 제어
export function requireRole(...allowedRoles: Role[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        401
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          error: 'Forbidden',
          message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
          yourRole: user.role,
        },
        403
      );
    }

    return next();
  };
}

// 사용자 생성 헬퍼 함수 (초기 설정용)
export async function createUser(
  username: string,
  role: Role = 'reader'
): Promise<string> {
  // 간단한 API 키 생성 (실제로는 더 강력한 방법 사용)
  const apiKey = generateAPIKey();

  await pool.query(
    'INSERT INTO users (username, api_key, role) VALUES ($1, $2, $3)',
    [username, apiKey, role]
  );

  return apiKey;
}

// API 키 생성
function generateAPIKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let apiKey = 'ak_'; // prefix

  for (let i = 0; i < 32; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return apiKey;
}

// 사용자 목록 조회 (admin만)
export async function listUsers() {
  const result = await pool.query(
    'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
  );

  return result.rows;
}

// 사용자 삭제 (admin만)
export async function deleteUser(userId: number) {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}

// 역할 변경 (admin만)
export async function updateUserRole(userId: number, newRole: Role) {
  await pool.query('UPDATE users SET role = $1 WHERE id = $2', [newRole, userId]);
}
