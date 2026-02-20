'use client';

import { useState, useEffect } from 'react';
import { Play, ExternalLink, Users, Map as MapIcon, Swords, Shield } from 'lucide-react';
import Image from 'next/image';

export default function GameList() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/games?limit=50') // Increased limit since we are grouping
            .then((res) => res.json())
            .then((data) => {
                setSessions(data.sessions);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-crewmate font-black animate-pulse text-2xl p-12 text-center">SCANNING MISSION ARCHIVES...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-gradient-cyan">MISSION LOGS</h1>
                    <p className="text-gray-400">Chronological archive of all deployed missions</p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-sm font-bold">
                    {sessions.length} ARCHIVES FOUND
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {sessions.map((session) => (
                    <SessionCard key={session.videoId} session={session} />
                ))}
            </div>
        </div>
    );
}

function SessionCard({ session }: { session: any }) {
    const imposterWins = session.games.filter((g: any) => g.winner === 'Imposter').length;
    const crewmateWins = session.games.filter((g: any) => g.winner === 'Crewmate').length;

    return (
        <div className="bg-glass rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row gap-8 group hover:border-white/10 transition-colors">
            {/* Thumbnail */}
            <div className="w-full md:w-80 aspect-video bg-black rounded-xl overflow-hidden relative flex-shrink-0 shadow-lg group-hover:ring-2 ring-white/20 transition-all">
                {session.thumbnail ? (
                    <Image
                        src={session.thumbnail}
                        alt="Session Thumbnail"
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gray-900">
                        <Play className="w-12 h-12" />
                    </div>
                )}

                <div className="absolute top-2 left-2 flex gap-2">
                    <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                        {session.games.length} ROUNDS
                    </div>
                </div>

                <div className="absolute bottom-2 right-2">
                    <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white border border-white/10 flex items-center gap-1">
                        <MapIcon className="w-3 h-3" /> {session.mapName}
                    </div>
                </div>

                <a
                    href={session.videoUrl}
                    target="_blank"
                    className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                >
                    <ExternalLink className="w-12 h-12 text-white drop-shadow-lg" />
                </a>
            </div>

            {/* Session Details */}
            <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        {/* Map Image Icon */}
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                            <Image
                                src={session.mapImage}
                                alt={session.mapName}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-none mb-1">
                                {session.mapName}
                            </h3>
                            <div className="text-xs text-gray-400 font-mono">
                                MISSION ID: {session.videoId}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4">
                        {imposterWins > 0 && <Badge label={`${imposterWins}x Imposter Victory`} color="red" icon={Swords} />}
                        {crewmateWins > 0 && <Badge label={`${crewmateWins}x Crewmate Victory`} color="cyan" icon={Shield} />}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                        {session.games.map((game: any) => (
                            <div key={game.gameNumber} className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="font-mono text-white/50">#{game.gameNumber}</span>
                                <span className={game.winner === 'Imposter' ? 'text-imposter font-bold' : 'text-crewmate font-bold'}>
                                    {game.winner} Win
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operatives Avatars */}
                <div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3" /> DEPLOYED OPERATIVES
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {session.players.map((p: any) => (
                            <PlayerAvatar key={p.name} name={p.name} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlayerAvatar({ name }: { name: string }) {
    const [imgSrc, setImgSrc] = useState(`/players/${name.toLowerCase()}.jpg`);
    return (
        <div className="relative group/avatar cursor-help">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden relative grayscale group-hover/avatar:grayscale-0 transition-all">
                <Image
                    src={imgSrc}
                    alt={name}
                    fill
                    className="object-cover"
                    onError={() => setImgSrc('/players/others.jpg')}
                />
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 backdrop-blur-md border border-white/20 rounded text-xs font-bold text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                {name}
            </div>
        </div>
    );
}

function Badge({ label, color, icon: Icon }: any) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider border ${color === 'red' ? 'bg-imposter/10 text-imposter border-imposter/20' : 'bg-crewmate/10 text-crewmate border-crewmate/20'}`}>
            <Icon className="w-3 h-3" /> {label}
        </div>
    );
}
