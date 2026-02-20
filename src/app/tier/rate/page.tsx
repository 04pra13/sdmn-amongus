import { getPlayerStats } from '@/lib/sheets';
import TierBuilder from './TierBuilder';

export default async function TierRatePage() {
    const players = await getPlayerStats();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            <h1 className="text-4xl font-black italic tracking-tighter text-white mb-8">
                BUILD YOUR TIER LIST
            </h1>
            <TierBuilder initialPlayers={players} />
        </div>
    );
}
