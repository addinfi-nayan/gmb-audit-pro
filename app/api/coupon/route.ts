import { NextResponse } from 'next/server';
import Keyv from 'keyv';

// Initialize Keyv (In-memory by default, persists as long as server process runs)
// For production persistence, initialize with a connection string e.g. new Keyv('redis://...')
const keyv = new Keyv(); 

export async function GET() {
    const count = await keyv.get('first20_count') || 0;
    const MAX_USES = 20;
    return NextResponse.json({ 
        count, 
        remaining: Math.max(0, MAX_USES - count) 
    });
}

export async function POST(req: Request) {
    try {
        const { code } = await req.json();
        
        if (code && code.toLowerCase() === 'first20') {
            const count = await keyv.get('first20_count') || 0;
            const MAX_USES = 20;

            if (count >= MAX_USES) {
                return NextResponse.json({ valid: false, message: 'Coupon limit reached' }, { status: 400 });
            }

            // Increment count
            await keyv.set('first20_count', count + 1);
            return NextResponse.json({ valid: true, count: count + 1 });
        }

        return NextResponse.json({ valid: false, message: 'Invalid coupon code' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
