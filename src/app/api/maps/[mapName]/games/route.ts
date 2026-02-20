import { NextResponse } from 'next/server';
import { getMapGames } from '@/lib/sheets';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ mapName: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const mapName = decodeURIComponent((await params).mapName);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const allMapGames = await getMapGames(mapName);

        // Group by Video ID
        const sessionsMap = new Map<string, any>();

        allMapGames.forEach((game: any) => {
            const videoId = game.videoId || 'unknown'; // Fallback for games without video link?
            if (!sessionsMap.has(videoId)) {
                sessionsMap.set(videoId, {
                    videoId,
                    thumbnail: game.thumbnail,
                    videoUrl: game.videoUrl, // Keep one URL
                    games: [],
                    maxGameNumber: 0
                });
            }
            const session = sessionsMap.get(videoId);
            session.games.push(game);
            if (game.gameNumber > session.maxGameNumber) {
                session.maxGameNumber = game.gameNumber;
            }
        });

        // Convert to array and sort by most recent game in the session
        const allSessions = Array.from(sessionsMap.values()).sort((a: any, b: any) => b.maxGameNumber - a.maxGameNumber);

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedSessions = allSessions.slice(startIndex, endIndex);
        const hasMore = endIndex < allSessions.length;

        return NextResponse.json({
            sessions: paginatedSessions,
            hasMore,
            total: allSessions.length,
            page
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
