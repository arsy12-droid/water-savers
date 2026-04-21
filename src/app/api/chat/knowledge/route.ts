import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = rateLimit(`knowledge:${clientIp}`, RATE_LIMITS.general);
    if (!rateCheck.success) {
      return NextResponse.json(
        { count: 0 },
        { status: 429 }
      );
    }

    const count = await db.chatKnowledge.count();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
