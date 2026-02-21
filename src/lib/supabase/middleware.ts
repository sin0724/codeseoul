import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Middleware에서는 인증 체크를 하지 않고 그냥 통과
  // 인증은 각 페이지의 클라이언트에서 처리
  return NextResponse.next();
}
