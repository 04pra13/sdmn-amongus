import { NextResponse } from 'next/server';
import { getPlayerStats, getKillPermutations, getImposterCombinations } from '@/lib/sheets';

type Props = {
    params: Promise<{ name: string }>
}

export async function GET(
    req: Request,
    { params }: Props
) {
    try {
        const name = (await params).name;
        const allPlayers = await getPlayerStats();
        // Case-insensitive search
        const player = allPlayers.find((p: any) => p.name.toLowerCase() === name.toLowerCase());

        if (!player) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        // const playerGames = await getPlayerGames(name); // Moved to /games endpoint
        const killPerms = await getKillPermutations();
        const imposterCombs = await getImposterCombinations();

        // Calculate Top 3 Targets
        const topTargets = killPerms
            .filter((k: any) => k.killer?.toLowerCase() === name.toLowerCase())
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 3);

        // Calculate Best Teammate (Duo only for simplicity and relevance)
        // Find combinations where this player is present AND it's a pair (length 2)
        const bestTeammates = imposterCombs
            .filter((c: any) => c.teammates.length === 2 &&
                c.teammates.some((t: string) => t.toLowerCase() === name.toLowerCase()))
            .map((c: any) => {
                const partner = c.teammates.find((t: string) => t.toLowerCase() !== name.toLowerCase());
                return { ...c, partner };
            })
            .sort((a: any, b: any) => b.winRate - a.winRate || b.wins - a.wins) // Sort by WR then Wins
            .slice(0, 3); // Get top 3 best teammates

        return NextResponse.json({
            ...player,
            // games: playerGames.sort((a: any, b: any) => b.gameNumber - a.gameNumber), // Removed to reduce payload
            topTargets,
            bestTeammates
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
