import { NextResponse } from 'next/server';
import { getPlayerGames } from '@/lib/sheets';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const name = (await params).name;

        // Note: In a real DB we would count and skip. 
        // With Sheets, we fetch all for this player and slice in memory.
        const allPlayerGames = await getPlayerGames(name);

        // Sort by game number desc
        allPlayerGames.sort((a: any, b: any) => b.gameNumber - a.gameNumber);

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const type = searchParams.get('type');

        const paginatedGames = allPlayerGames.slice(startIndex, endIndex);
        const hasMore = endIndex < allPlayerGames.length;

        return NextResponse.json({
            games: paginatedGames,
            hasMore,
            total: allPlayerGames.length,
            page
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
