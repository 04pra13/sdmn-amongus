import { NextResponse } from 'next/server';
import { getGames, extractYouTubeID } from '@/lib/sheets';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const allGames = await getGames();

        // Group by Video ID
        const sessionsMap = new Map<string, any>();

        const mapImages: Record<string, string> = {
            "The Skeld": "/maps/The_Skeld.webp",
            "MIRA HQ": "/maps/MIRA_HQ.webp",
            "Polus": "/maps/Polus.webp",
            "The Airship": "/maps/The_Airship.webp",
            "The Fungle": "/maps/The_Fungle.webp",
            "Bigger Skeld": "/maps/Bigger_Skeld.webp"
        };

        allGames.forEach((game: any) => {
            const videoId = extractYouTubeID(game.videoUrl) || 'unknown';

            if (!sessionsMap.has(videoId)) {
                sessionsMap.set(videoId, {
                    videoId,
                    thumbnail: videoId !== 'unknown' ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null,
                    videoUrl: game.videoUrl,
                    mapName: game.mapName,
                    mapImage: mapImages[game.mapName] || "/maps/error.jpeg",
                    date: null, // Sheet doesn't have date, could fetch if needed but expensive
                    games: [],
                    players: [], // Will collect unique players
                    maxGameNumber: 0
                });
            }

            const session = sessionsMap.get(videoId);
            session.games.push(game);

            if (game.gameNumber > session.maxGameNumber) {
                session.maxGameNumber = game.gameNumber;
            }

            // Add players if not already present
            game.players.forEach((p: any) => {
                if (!session.players.some((sp: any) => sp.name === p.name)) {
                    session.players.push(p);
                }
            });
        });

        // Convert to array and sort by most recent game
        const allSessions = Array.from(sessionsMap.values())
            .sort((a: any, b: any) => b.maxGameNumber - a.maxGameNumber);

        const total = allSessions.length;
        const start = (page - 1) * limit;
        const sessions = allSessions.slice(start, start + limit);

        return NextResponse.json({
            games: sessions, // Keeping key 'games' for compatibility or change to 'sessions'? 
            // Frontend expects 'games' but I will update Frontend too. 
            // Let's stick to 'sessions' to be clear it's changed.
            sessions,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
