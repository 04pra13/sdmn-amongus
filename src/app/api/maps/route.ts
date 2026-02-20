import { NextResponse } from 'next/server';
import { getMaps } from '@/lib/sheets';

export async function GET() {
    try {
        const maps = await getMaps();
        // Sort by most played
        maps.sort((a: any, b: any) => b.count - a.count);
        return NextResponse.json(maps);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
