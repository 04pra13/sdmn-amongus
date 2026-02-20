'use client';

import { useState, useEffect } from 'react';
import { Shield, Skull, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PlayersPage() {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/players')
            .then((res) => res.json())
            .then((data) => {
                setPlayers(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-crewmate font-black animate-pulse">ANALYZING CREW MEMBERS...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black italic tracking-tighter text-gradient-cyan">PERSONNEL FILES</h1>
                <p className="text-gray-400">Detailed dossiers on every operative in the fleet</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {players.map((player) => {
                    const winRate = Math.round(((player.crewmateWins + player.imposterWins) / (player.gamesPlayed || 1)) * 100);
                    return (
                        <Link
                            key={player.id || player.name}
                            href={`/players/${player.name}`}
                            className="amongus-card bg-glass group hover:border-crewmate/30 block hover:scale-[1.02] transition-all duration-300"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-2 overflow-hidden relative ${winRate > 60 ? 'border-crewmate/50 glow-crewmate' : 'border-white/10'}`}>
                                    <PlayerImage name={player.name} />
                                </div>
                                <div>
                                    <div className="text-xl font-black tracking-tight group-hover:text-crewmate transition-colors">{player.name}</div>
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{player.totalGames} Missions</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1 mb-1">
                                        <Shield className="w-3 h-3 text-crewmate" /> Crewmate
                                    </div>
                                    <div className="text-lg font-black">{player.totalAsCrewmate}</div>
                                    <div className="text-[10px] text-gray-600 font-bold">{player.crewmateWins} Wins</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1 mb-1">
                                        <Skull className="w-3 h-3 text-imposter" /> Imposter
                                    </div>
                                    <div className="text-lg font-black">{player.totalAsImposter}</div>
                                    <div className="text-[10px] text-gray-600 font-bold">{player.imposterWins} Wins</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span>General Win Rate</span>
                                    <span className={winRate > 50 ? 'text-crewmate' : 'text-gray-400'}>{winRate}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${winRate > 50 ? 'bg-crewmate shadow-[0_0_8px_rgba(0,238,255,0.5)]' : 'bg-gray-600'}`}
                                        style={{ width: `${winRate}%` }}
                                    />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function PlayerImage({ name }: { name: string }) {
    const [src, setSrc] = useState(`/players/${name.toLowerCase()}.jpg`);

    return (
        <Image
            src={src}
            alt={name}
            fill
            className="object-cover"
            onError={() => setSrc('/players/others.jpg')}
        />
    );
}
