import { NextResponse } from 'next/server';

export function proxy(request) {
    const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');
    
    // We want to force auth on everything else
    if (!isAuthRoute) {
        const authCookie = request.cookies.get('moms_auth');
        
        // If not authenticated and trying to access API, block it
        if (!authCookie && request.nextUrl.pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*']
}
