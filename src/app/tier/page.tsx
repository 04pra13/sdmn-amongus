import Link from 'next/link';
import { getPlayerStats } from '@/lib/sheets';
import { getPlayerImage } from '@/lib/playerUtils';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { User, Plus } from 'lucide-react';

export const revalidate = 0;

export const metadata = {
    title: "Community Tier List - Rate Players | SDMN Among Us",
    description: "View the official community-ranked tier list of Sidemen Among Us players. Rate your own list and contribute to the hive mind.",
    openGraph: {
        title: "Community Tier List",
        description: "Who is the best Imposter? Check the community rankings.",
        images: ["/og-tierlist.jpg"],
    },
};

export default async function TierListPage() {
    const players = await getPlayerStats();

    // Server-side fetch from Convex
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const aggregatedTiers = await client.query(api.tier.getAggregatedTierList);

    // Group players by tier
    const tiers: Record<string, any[]> = { S: [], A: [], B: [], C: [], D: [], F: [] };
    const rankedPlayerNames = Object.keys(aggregatedTiers);

    players.forEach(p => {
        const tier = aggregatedTiers[p.name] || 'Unranked';
        if (tiers[tier]) {
            tiers[tier].push(p);
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-5xl font-black italic tracking-tighter text-white flex items-center gap-4">
                    <User className="w-12 h-12 text-imposter" />
                    COMMUNITY TIER LIST
                </h1>
                <Link
                    href="/tier/rate"
                    className="bg-imposter hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-red-900/20"
                >
                    <Plus className="w-5 h-5" />
                    RATE YOURS
                </Link>
            </div>

            <div className="space-y-4">
                {['S', 'A', 'B', 'C', 'D', 'F'].map((tier) => (
                    <div key={tier} className="flex">
                        <div className={`w-32 flex-shrink-0 flex items-center justify-center text-4xl font-black italic rounded-l-xl ${getTierColor(tier)} text-black`}>
                            {tier}
                        </div>
                        <div className="flex-1 bg-[#1a1a1a] min-h-[100px] p-4 flex flex-wrap gap-2 rounded-r-xl border-y border-r border-white/10">
                            {tiers[tier].map((player) => (
                                <div key={player.name} className="relative group">
                                    <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-white/50 transition-all">
                                        <img
                                            src={getPlayerImage(player.name)}
                                            alt={player.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                        {player.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* note */}
            <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4 ml-4">Note</h3>
                <div className="bg-white/5 min-h-[150px] p-4 rounded-xl border border-white/10 flex flex-wrap gap-2 transition-colors hover:bg-white/10">
                    <p className="text-white">
                        This is a community tier list.
                        <br />
                        Please rate the players based on their skill and contribution to the group.
                        <br />
                        And Based on people's rating, we will have a final tier list.
                        <br />
                        So please rate the players honestly and fairly.
                    </p>
                </div>
            </div>
        </div>
    );
}

function getTierColor(tier: string) {
    switch (tier) {
        case 'S': return 'bg-[#ff7f7f]';
        case 'A': return 'bg-[#ffbf7f]';
        case 'B': return 'bg-[#ffdf7f]';
        case 'C': return 'bg-[#ffff7f]';
        case 'D': return 'bg-[#bfff7f]';
        case 'F': return 'bg-[#7fff7f]'; // Wait, usually F is red/bad? Standard tiermaker colors: S=Red, A=Orange, B=Yellow, C=Greenish, D=Blueish?
        // Let's stick to the image provided colors if possible.
        // Image: S=Red(ish), A=Orange, B=Yellow, C=Yellow(light), D=Green(light), F=Green
        default: return 'bg-gray-500';
    }
}
