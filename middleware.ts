import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  // Allow unauthenticated requests to go through
  // Only enforce auth if needed for specific features
  return;
}

export const config = {
  matcher: [], // Don't match any routes - allow all through
};
