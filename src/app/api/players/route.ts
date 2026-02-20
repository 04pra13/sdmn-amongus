import { NextResponse } from 'next/server';
import { getPlayerStats } from '@/lib/sheets';

export async function GET() {
    try {
        const players = await getPlayerStats();
        return NextResponse.json(players);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
