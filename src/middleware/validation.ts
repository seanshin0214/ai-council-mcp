/**
 * Input Validation Middleware for MCP Server
 * MCP는 stdio를 사용하므로 Hono 미들웨어 대신 직접 validation 함수 제공
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}

// 1. 프롬프트 인젝션 방어
export function validatePromptInjection(input: string): ValidationResult {
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
    /\{\{.*system.*\}\}/i,
    /override\s+system/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: 'Potential prompt injection detected. Please rephrase your question.',
        code: 'PROMPT_INJECTION',
      };
    }
  }

  return { valid: true };
}

// 2. PII (개인정보) 탐지
export function validatePII(input: string): ValidationResult {
  const piiPatterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g, // US SSN
    phone: /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    koreanRRN: /\b\d{6}-\d{7}\b/g, // 한국 주민등록번호
  };

  const detectedPII: string[] = [];

  for (const [type, pattern] of Object.entries(piiPatterns)) {
    if (pattern.test(input)) {
      detectedPII.push(type);
    }
  }

  if (detectedPII.length > 0) {
    console.warn(`⚠️ PII detected: ${detectedPII.join(', ')}`);
    return {
      valid: false,
      error: `Personal information detected (${detectedPII.join(', ')}). Please remove sensitive data.`,
      code: 'PII_DETECTED',
    };
  }

  return { valid: true };
}

// 3. 입력 크기 제한
export function validateInputSize(
  input: string,
  maxLength: number = 50000
): ValidationResult {
  if (input.length > maxLength) {
    return {
      valid: false,
      error: `Input exceeds maximum length of ${maxLength} characters (${input.length} provided)`,
      code: 'INPUT_TOO_LARGE',
    };
  }

  return { valid: true };
}

// 4. SQL Injection 패턴 탐지
export function validateSQLInjection(input: string): ValidationResult {
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
    if (pattern.test(input)) {
      return {
        valid: false,
        error: 'Potential SQL injection detected',
        code: 'SQL_INJECTION',
      };
    }
  }

  return { valid: true };
}

// 5. XSS (Cross-Site Scripting) 방어
export function validateXSS(input: string): ValidationResult {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onerror, etc.
    /<iframe/gi,
    /eval\s*\(/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: 'Potential XSS attack detected',
        code: 'XSS_DETECTED',
      };
    }
  }

  return { valid: true };
}

// 6. Rate Limiting용 토큰 버킷
export class RateLimiter {
  private tokens: Map<string, { count: number; resetAt: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // 매 분마다 오래된 토큰 정리
    setInterval(() => this.cleanup(), 60000);
  }

  check(userId: string = 'default'): ValidationResult {
    const now = Date.now();
    const userToken = this.tokens.get(userId);

    if (!userToken || now > userToken.resetAt) {
      // 새 윈도우 시작
      this.tokens.set(userId, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return { valid: true };
    }

    if (userToken.count >= this.maxRequests) {
      const resetIn = Math.ceil((userToken.resetAt - now) / 1000);
      return {
        valid: false,
        error: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
        code: 'RATE_LIMIT_EXCEEDED',
      };
    }

    userToken.count++;
    return { valid: true };
  }

  private cleanup() {
    const now = Date.now();
    for (const [userId, token] of this.tokens.entries()) {
      if (now > token.resetAt) {
        this.tokens.delete(userId);
      }
    }
  }
}

// 종합 검증 함수
export function validateInput(
  input: string,
  options: {
    checkPII?: boolean;
    checkInjection?: boolean;
    checkXSS?: boolean;
    checkSQL?: boolean;
    maxLength?: number;
  } = {}
): ValidationResult {
  const {
    checkPII = true,
    checkInjection = true,
    checkXSS = true,
    checkSQL = true,
    maxLength = 50000,
  } = options;

  // 1. 크기 검증
  const sizeCheck = validateInputSize(input, maxLength);
  if (!sizeCheck.valid) return sizeCheck;

  // 2. 프롬프트 인젝션
  if (checkInjection) {
    const injectionCheck = validatePromptInjection(input);
    if (!injectionCheck.valid) return injectionCheck;
  }

  // 3. PII 탐지
  if (checkPII) {
    const piiCheck = validatePII(input);
    if (!piiCheck.valid) return piiCheck;
  }

  // 4. SQL Injection
  if (checkSQL) {
    const sqlCheck = validateSQLInjection(input);
    if (!sqlCheck.valid) return sqlCheck;
  }

  // 5. XSS
  if (checkXSS) {
    const xssCheck = validateXSS(input);
    if (!xssCheck.valid) return xssCheck;
  }

  return { valid: true };
}

// 출력 새니타이징 (XSS 방어)
export function sanitizeOutput(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
