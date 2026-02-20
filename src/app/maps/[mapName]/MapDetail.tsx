'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { Map as MapIcon, History, ExternalLink, Swords, Shield, Play } from 'lucide-react';
import Link from 'next/link';

export default function MapDetailPage({ params }: { params: Promise<{ mapName: string }> }) {
    const resolvedParams = use(params);
    const mapName = decodeURIComponent(resolvedParams.mapName);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const mapImages: Record<string, string> = {
        "The Skeld": "/maps/The_Skeld.webp",
        "MIRA HQ": "/maps/MIRA_HQ.webp",
        "Polus": "/maps/Polus.webp",
        "The Airship": "/maps/The_Airship.webp",
        "The Fungle": "/maps/The_Fungle.webp",
        "Bigger Skeld": "/maps/Bigger_Skeld.webp"
    };

    const mapImage = mapImages[mapName] || "/maps/error.jpeg";

    const fetchSessions = async (pageNum: number) => {
        setLoadingMore(true);
        try {
            const res = await fetch(`/api/maps/${mapName}/games?page=${pageNum}&limit=10`);
            const data = await res.json();

            if (pageNum === 1) {
                setSessions(data.sessions);
            } else {
                setSessions(prev => [...prev, ...data.sessions]);
            }

            setHasMore(data.hasMore);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchSessions(1);
    }, [mapName]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchSessions(nextPage);
        }
    };

    if (loading && sessions.length === 0) return <MapSkeleton />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="relative rounded-3xl overflow-hidden aspect-[21/9] border-2 border-white/5 shadow-2xl group">
                <Image
                    src={mapImage}
                    alt={mapName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 md:p-12">
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-2 drop-shadow-lg">
                        {mapName}
                    </h1>
                </div>
            </div>

            {/* Mission Logs */}
            <div className="space-y-6">
                <h2 className="text-4xl font-black italic tracking-tighter text-white mb-8 flex items-center gap-3">
                    <History className="w-8 h-8" /> MISSION ARCHIVE
                </h2>

                <div className="grid grid-cols-1 gap-6">
                    {sessions.map((session: any) => {
                        const imposterWins = session.games.filter((g: any) => g.winner === 'Imposter').length;
                        const crewmateWins = session.games.filter((g: any) => g.winner === 'Crewmate').length;
                        // Get unique players from the first game of the session (usually same lobby)
                        const lobbyPlayers = session.games[0]?.players || [];

                        return (
                            <div key={session.videoId} className="bg-glass rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row gap-8 group hover:border-white/10 transition-colors">
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
                                        <div className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-widest">DEPLOYED OPERATIVES</div>
                                        <div className="flex flex-wrap gap-2">
                                            {lobbyPlayers.map((p: any) => (
                                                <PlayerAvatar key={p.name} name={p.name} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {hasMore && (
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-8 rounded-full border border-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loadingMore ? 'Loading...' : 'Load More Archives'}
                        </button>
                    </div>
                )}
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

function MapSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="aspect-[21/9] bg-white/5 rounded-3xl" />
            <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl" />)}
            </div>
        </div>
    );
}
