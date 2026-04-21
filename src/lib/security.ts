import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/[\w-]+\.space\.z\.ai$/,
];

function isOriginAllowed(origin: string): boolean {
  return ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));
}

const MAX_BODY_SIZE = 1024 * 1024;

export function validateCsrf(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (!origin && !referer) {
    return NextResponse.json(
      { success: false, error: 'Forbidden — missing origin and referer' },
      { status: 403 },
    );
  }

  if (origin && !isOriginAllowed(origin)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden — invalid origin' },
      { status: 403 },
    );
  }

  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer);
      if (!isOriginAllowed(refererUrl.origin)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden — invalid referer' },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Forbidden — malformed referer' },
        { status: 403 },
      );
    }
  }

  return null;
}

export function limitBodySize(request: NextRequest): NextResponse | null {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (!isNaN(size) && size > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Request body too large' },
        { status: 413 },
      );
    }
  }

  return null;
}

const IP_REGEX = /^(\d{1,3}(\.\d{1,3}){3}|[0-9a-fA-F:]+)$/;

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp && IP_REGEX.test(firstIp)) return firstIp;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp && IP_REGEX.test(realIp)) return realIp;
  return 'unknown';
}

export function securityGuard(request: NextRequest): NextResponse | null {
  const csrf = validateCsrf(request);
  if (csrf) return csrf;

  const size = limitBodySize(request);
  if (size) return size;

  return null;
}
