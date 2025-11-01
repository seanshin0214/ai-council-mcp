import { Context, Next } from 'hono';

// OWASP LLM Top 10 보안 미들웨어

// 1. 프롬프트 인젝션 방어
export async function preventPromptInjection(c: Context, next: Next) {
  const body = await c.req.json();
  const query = body.query || '';

  // 위험한 패턴 탐지
  const dangerousPatterns = [
    /ignore\s+(previous|above|all)\s+instructions?/i,
    /forget\s+(everything|all|previous)/i,
    /you\s+are\s+now/i,
    /new\s+instructions?:/i,
    /system\s*:\s*/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      return c.json(
        {
          error: 'Potential prompt injection detected',
          code: 'PROMPT_INJECTION',
        },
        400
      );
    }
  }

  return next();
}

// 2. PII (개인정보) 탐지 및 차단
export async function detectPII(c: Context, next: Next) {
  const body = await c.req.json();
  const query = body.query || '';

  // PII 패턴
  const piiPatterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g, // 미국 SSN
    phone: /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  };

  const detectedPII: string[] = [];

  for (const [type, pattern] of Object.entries(piiPatterns)) {
    if (pattern.test(query)) {
      detectedPII.push(type);
    }
  }

  if (detectedPII.length > 0) {
    console.warn(`PII detected in query: ${detectedPII.join(', ')}`);

    return c.json(
      {
        error: 'Personal Identifiable Information detected',
        types: detectedPII,
        code: 'PII_DETECTED',
      },
      400
    );
  }

  return next();
}

// 3. 입력 크기 제한
export async function limitInputSize(c: Context, next: Next) {
  const body = await c.req.json();
  const query = body.query || '';

  const MAX_QUERY_LENGTH = 10000; // 10KB

  if (query.length > MAX_QUERY_LENGTH) {
    return c.json(
      {
        error: 'Query exceeds maximum length',
        maxLength: MAX_QUERY_LENGTH,
        code: 'INPUT_TOO_LARGE',
      },
      400
    );
  }

  return next();
}

// 4. SQL Injection 패턴 탐지
export async function preventSQLInjection(c: Context, next: Next) {
  const body = await c.req.json();
  const query = body.query || '';

  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /;.*--.*/,
    /\/\*.*\*\//,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(query)) {
      return c.json(
        {
          error: 'Potential SQL injection detected',
          code: 'SQL_INJECTION',
        },
        400
      );
    }
  }

  return next();
}

// 5. XSS (Cross-Site Scripting) 방어
export async function preventXSS(c: Context, next: Next) {
  const body = await c.req.json();
  const query = body.query || '';

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onerror, etc.
    /<iframe/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(query)) {
      return c.json(
        {
          error: 'Potential XSS attack detected',
          code: 'XSS_DETECTED',
        },
        400
      );
    }
  }

  return next();
}

// 종합 보안 미들웨어
export function securityMiddleware() {
  return [
    limitInputSize,
    preventPromptInjection,
    detectPII,
    preventSQLInjection,
    preventXSS,
  ];
}
