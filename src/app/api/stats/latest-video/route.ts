import { NextResponse } from 'next/server';
import { getLatestAmongUsVideo } from '@/lib/youtube';

export async function GET() {
    try {
        const video = await getLatestAmongUsVideo();
        return NextResponse.json({ video });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
