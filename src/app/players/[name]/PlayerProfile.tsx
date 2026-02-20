'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Shield, Skull, Target, TrendingUp, Award, Swords, Siren, History, ExternalLink, Map as MapIcon, Mic, UserMinus } from 'lucide-react';

export default function PlayerProfile() {
    const params = useParams();
    const name = params.name as string;
    const [player, setPlayer] = useState<any>(null);
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingGames, setLoadingGames] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [imgSrc, setImgSrc] = useState(`/players/${name.toLowerCase()}.jpg`);

    // Fetch Player Stats
    useEffect(() => {
        fetch(`/api/players/${name}`)
            .then((res) => {
                if (!res.ok) throw new Error('Player not found');
                return res.json();
            })
            .then((data) => {
                setPlayer(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [name]);

    // Fetch Games Pagination
    const fetchGames = async (pageNum: number) => {
        setLoadingGames(true);
        try {
            const res = await fetch(`/api/players/${name}/games?page=${pageNum}&limit=10`);
            const data = await res.json();

            if (pageNum === 1) {
                setGames(data.games);
            } else {
                setGames(prev => [...prev, ...data.games]);
            }

            setHasMore(data.hasMore);
        } catch (error) {
            console.error("Failed to fetch games", error);
        } finally {
            setLoadingGames(false);
        }
    };

    useEffect(() => {
        fetchGames(1);
    }, [name]);

    const loadMore = () => {
        if (!loadingGames && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchGames(nextPage);
        }
    };

    if (loading) return <PlayerSkeleton />;

    if (!player) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="text-imposter text-6xl font-black mb-4">404</div>
            <div className="text-xl text-gray-400">OPERATIVE NOT FOUND IN DATABASE</div>
        </div>
    );

    const winRate = Math.round(((player.crewmateWins + player.imposterWins) / (player.gamesPlayed)) * 100);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Profile */}
            <div className="relative rounded-3xl bg-glass overflow-hidden p-8 border border-white/5">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-crewmate/10 to-transparent pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                    <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black rotate-3 hover:rotate-0 transition-all duration-500">
                        <Image
                            src={imgSrc}
                            alt={player.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                            onError={() => setImgSrc('/players/others.jpg')}
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-6xl font-black italic tracking-tighter text-white mb-2">{player.name}</h1>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
                            <Badge label="Veteran" color="cyan" icon={Award} />
                            <div className="bg-white/5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-gray-400 border border-white/5">
                                {player.totalGames} Missions Logged
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatBox label="Total Wins" value={player.wins} color="cyan" />
                            <StatBox label="Win Rate" value={`${winRate}%`} color={winRate > 50 ? 'cyan' : 'gray'} />
                            <StatBox label="Kills" value={player.kills} color="red" />
                            <StatBox label="Deaths" value={player.deaths} color="gray" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Imposter Stats */}
                <div className="amongus-card bg-glass border-l-4 border-l-imposter relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Swords className="w-32 h-32 text-imposter" />
                    </div>
                    <h2 className="text-2xl font-black italic text-imposter mb-6 flex items-center gap-3">
                        <Swords className="w-6 h-6" /> IMPOSTER PERFORMANCE
                    </h2>

                    <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-end">
                            <div className="text-sm font-bold text-gray-400 uppercase">Win Rate</div>
                            <div className="text-4xl font-black text-imposter">{player.imposterWinRate}%</div>
                        </div>
                        <ProgressBar value={player.imposterWinRate} color="red" />

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <StatDetail label="Games" value={player.imposterGames} />
                            <StatDetail label="Wins" value={player.imposterWins} color="red" />
                            <StatDetail label="Kills" value={player.killsAsImposter} color="red" />
                            <StatDetail label="Kills/Game" value={player.killsPerImposterGame} />
                        </div>
                    </div>
                </div>

                {/* Crewmate Stats */}
                <div className="amongus-card bg-glass border-l-4 border-l-crewmate relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Shield className="w-32 h-32 text-crewmate" />
                    </div>
                    <h2 className="text-2xl font-black italic text-crewmate mb-6 flex items-center gap-3">
                        <Siren className="w-6 h-6" /> CREWMATE PERFORMANCE
                    </h2>

                    <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-end">
                            <div className="text-sm font-bold text-gray-400 uppercase">Win Rate</div>
                            <div className="text-4xl font-black text-crewmate">{player.crewmateWinRate}%</div>
                        </div>
                        <ProgressBar value={player.crewmateWinRate} color="cyan" />

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <StatDetail label="Games" value={player.crewmateGames} />
                            <StatDetail label="Wins" value={player.crewmateWins} color="cyan" />
                            <StatDetail label="Tasks Done" value={player.tasksCompleted} color="cyan" />
                            <StatDetail label="Completion %" value={`${player.taskCompletionRate}%`} />
                        </div>
                    </div>
                </div>

                {/* Specialized Roles & Combat */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="amongus-card bg-glass border-t-4 border-t-purple-500">
                        <h3 className="text-lg font-black text-purple-500 mb-4 flex items-center gap-2"><Target className="w-4 h-4" /> COMBAT STATS</h3>
                        <div className="space-y-3">
                            <Row label="KDR" value={player.kdr} />
                            <Row label="Total Kills" value={player.kills} />
                            <Row label="Total Deaths" value={player.deaths} />
                            <Row label="First Death" value={player.firstDeathOfGame} />
                            <Row label="Death R1" value={player.deathInFirstRound} />
                        </div>
                    </div>

                    <div className="amongus-card bg-glass border-t-4 border-t-yellow-500">
                        <h3 className="text-lg font-black text-yellow-500 mb-4 flex items-center gap-2"><Siren className="w-4 h-4" /> GAME EVENTS</h3>
                        <div className="space-y-3">
                            <Row label="Meetings" value={player.emergencyMeetings} />
                            <Row label="Bodies Found" value={player.bodiesReported} />
                            <Row label="Voted Out" value={player.votedOut} />
                            <Row label="Voted First" value={player.votedOutFirst} />
                            <Row label="Rage Quits" value={player.rageQuit} highlight={player.rageQuit > 0} />
                        </div>
                    </div>

                    <div className="amongus-card bg-glass border-t-4 border-t-pink-500">
                        <h3 className="text-lg font-black text-pink-500 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> SPECIAL ROLES</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Neutral Roles</div>
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-300">{player.neutralGames} Games</span>
                                    <span className="font-black text-white">{player.neutralWins} Wins ({player.neutralWinRate}%)</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Lover Roles</div>
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-300">{player.loverGames} Games</span>
                                    <span className="font-black text-white">{player.loverWins} Wins ({player.loverWinRate}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Nemesis & Alliance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Top Targets */}
                <div className="bg-glass rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Target className="w-32 h-32 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black italic text-white mb-6 flex items-center gap-2">
                        <Target className="w-6 h-6 text-red-500" /> TOP TARGETS
                    </h3>
                    <div className="space-y-4 relative z-10">
                        {player.topTargets?.map((target: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-black text-sm border border-red-500/30">
                                        #{i + 1}
                                    </div>
                                    <span className="font-bold text-white text-lg">{target.victim}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-black text-red-500">{target.count}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Eliminations</span>
                                </div>
                            </div>
                        ))}
                        {(!player.topTargets || player.topTargets.length === 0) && (
                            <div className="text-gray-500 italic">No assassination data available.</div>
                        )}
                    </div>
                </div>

                {/* Best Teammates */}
                <div className="bg-glass rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Award className="w-32 h-32 text-yellow-500" />
                    </div>
                    <h3 className="text-2xl font-black italic text-white mb-6 flex items-center gap-2">
                        <Award className="w-6 h-6 text-yellow-500" /> BEST PARTNERS
                    </h3>
                    <div className="space-y-4 relative z-10">
                        {player.bestTeammates?.map((tm: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-black text-sm border border-yellow-500/30">
                                        #{i + 1}
                                    </div>
                                    <span className="font-bold text-white text-lg">{tm.partner}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-yellow-500">{tm.winRate}%</span>
                                        <span className="text-xs text-gray-400 font-bold bg-white/5 px-2 py-1 rounded">
                                            {tm.wins}W / {tm.games}G
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Win Rate (Duo)</span>
                                </div>
                            </div>
                        ))}
                        {(!player.bestTeammates || player.bestTeammates.length === 0) && (
                            <div className="text-gray-500 italic">No partnership data available.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mission History */}
            <div className="space-y-6">
                <h2 className="text-4xl font-black italic tracking-tighter text-white mb-8 flex items-center gap-3">
                    <History className="w-8 h-8" /> MISSION LOGS ({games.length})
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    {games.map((game: any) => (
                        <div key={game.gameNumber} className="bg-glass rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row gap-6 group hover:border-white/10 transition-colors">
                            {/* Thumbnail & Video Link */}
                            <div className="w-full md:w-64 aspect-video bg-black rounded-xl overflow-hidden relative flex-shrink-0 group-hover:ring-2 ring-white/20 transition-all">
                                {game.thumbnail ? (
                                    <Image
                                        src={game.thumbnail}
                                        alt={`Game ${game.gameNumber}`}
                                        fill
                                        className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gray-900">
                                        <History className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                                    #{game.gameNumber}
                                </div>
                                <a
                                    href={game.videoUrl}
                                    target="_blank"
                                    className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                                >
                                    <ExternalLink className="w-12 h-12 text-white drop-shadow-lg" />
                                </a>
                            </div>

                            {/* Game Details */}
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <Badge
                                                label={game.playedRole || 'Unknown'}
                                                color={game.playedRole === 'Imposter' ? 'red' : 'cyan'}
                                                icon={game.playedRole === 'Imposter' ? Swords : Shield}
                                            />
                                            {game.winner === game.playedRole ? (
                                                <span className="text-green-400 text-xs font-black uppercase tracking-widest bg-green-400/10 px-2 py-1 rounded border border-green-400/20">Victory</span>
                                            ) : (
                                                <span className="text-red-400 text-xs font-black uppercase tracking-widest bg-red-400/10 px-2 py-1 rounded border border-red-400/20">Defeat</span>
                                            )}
                                        </div>
                                        <div className="text-xl font-bold text-gray-200 flex items-center gap-2">
                                            <MapIcon className="w-4 h-4 text-gray-500" /> {game.mapName}
                                        </div>
                                    </div>
                                </div>

                                {/* Event Stream */}
                                <div className="space-y-2">
                                    {game.events?.length > 0 ? (
                                        game.events.map((event: any, i: number) => (
                                            <div key={i} className="text-sm font-mono flex items-center gap-2 text-gray-400 bg-black/20 p-2 rounded border border-white/5">
                                                <span className="text-xs text-gray-600 font-bold">SEQ {event.sequence}</span>
                                                <EventIcon type={event.eventType} />
                                                <span className={event.primaryPlayer?.toLowerCase() === player.name.toLowerCase() ? 'text-white font-bold' : 'text-gray-400'}>
                                                    {event.primaryPlayer}
                                                </span>
                                                <span className="text-gray-500 italic">{event.eventType}</span>
                                                {event.secondaryPlayer && (
                                                    <span className={event.secondaryPlayer?.toLowerCase() === player.name.toLowerCase() ? 'text-white font-bold' : 'text-gray-400'}>
                                                        {event.secondaryPlayer}
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-xs text-gray-600 italic px-2">No significant events recorded for this operative.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {hasMore && (
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={loadMore}
                            disabled={loadingGames}
                            className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-8 rounded-full border border-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loadingGames ? (
                                <>Loading...</>
                            ) : (
                                <>
                                    Load More Missions
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function PlayerSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="h-64 bg-glass rounded-3xl border border-white/5 p-8 flex gap-8">
                <div className="w-48 h-48 bg-white/5 rounded-3xl" />
                <div className="flex-1 space-y-4">
                    <div className="h-12 w-1/2 bg-white/5 rounded-xl" />
                    <div className="h-8 w-1/4 bg-white/5 rounded-xl" />
                    <div className="grid grid-cols-4 gap-4 mt-8">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatDetail({ label, value, color }: any) {
    const textColor = color === 'red' ? 'text-imposter' : color === 'cyan' ? 'text-crewmate' : 'text-white';
    return (
        <div className="bg-black/20 p-4 rounded-xl">
            <div className="text-[10px] text-gray-500 font-bold uppercase">{label}</div>
            <div className={`text-xl font-black ${textColor}`}>{value}</div>
        </div>
    );
}

function Row({ label, value, highlight }: any) {
    return (
        <div className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">{label}</span>
            <span className={`font-mono font-bold ${highlight ? 'text-red-500' : 'text-white'}`}>{value}</span>
        </div>
    );
}

function EventIcon({ type }: { type: string }) {
    if (type.includes('Killed')) return <Swords className="w-3 h-3 text-red-500" />;
    if (type.includes('Meeting')) return <Mic className="w-3 h-3 text-yellow-500" />;
    if (type.includes('Reported')) return <Siren className="w-3 h-3 text-cyan-500" />;
    if (type.includes('Voted')) return <UserMinus className="w-3 h-3 text-gray-500" />;
    return <div className="w-3 h-3 bg-gray-700 rounded-full" />;
}

function StatBox({ label, value, color }: any) {
    const textColor = color === 'red' ? 'text-imposter' : color === 'cyan' ? 'text-crewmate' : 'text-white';
    return (
        <div className="bg-black/20 p-4 rounded-xl text-center border border-white/5">
            <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</div>
            <div className={`text-2xl font-black ${textColor}`}>{value}</div>
        </div>
    );
}

function Badge({ label, color, icon: Icon }: any) {
    return (
        <div className={`flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${color === 'red' ? 'bg-imposter/10 text-imposter border-imposter/20' : 'bg-crewmate/10 text-crewmate border-crewmate/20'}`}>
            <Icon className="w-3 h-3" /> {label}
        </div>
    );
}

function ProgressBar({ value, color }: { value: number, color: 'red' | 'cyan' }) {
    return (
        <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
                className={`h-full transition-all duration-1000 ${color === 'red' ? 'bg-imposter shadow-[0_0_10px_#ff1f1f]' : 'bg-crewmate shadow-[0_0_10px_#00eeff]'}`}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}
