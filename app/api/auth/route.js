import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { pin } = body;
        
        const MASTER_PIN = process.env.MASTER_PIN;

        // If no PIN is configured in env, we bypass auth directly for open-source simplicity.
        // But if configured, must match exactly.
        if (!MASTER_PIN || pin === MASTER_PIN) {
            const response = NextResponse.json({ success: true, message: 'Authenticated' });
            // Set cookie for 24 hours
            response.cookies.set({
                name: 'moms_auth',
                value: 'true',
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24
            });
            return response;
        }

        return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
