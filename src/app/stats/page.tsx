'use client';

import { useState, useEffect } from 'react';
import { Gamepad2, Users, Trophy, Map as MapIcon, Skull, CheckCircle2, MessageSquare, Search } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/stats/overview')
            .then((res) => res.json())
            .then((data) => {
                setStats(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="animate-pulse text-crewmate font-bold tracking-widest text-2xl">LOADING COMMAND CENTER...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div>
                <h1 className="text-4xl font-black italic tracking-tighter text-gradient-cyan mb-2">
                    CENTRAL COMMAND
                </h1>
                <p className="text-gray-400">Live analytics from the SDMN Space Station</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Games"
                    value={stats.totalGames}
                    icon={Gamepad2}
                    color="cyan"
                />
                <StatCard
                    label="Crewmate Wins"
                    value={stats.crewmateWins}
                    icon={Users}
                    color="cyan"
                    subValue={`${stats.additionalStats?.crewmateWinsByTasks} by Tasks`}
                />
                <StatCard
                    label="Imposter Wins"
                    value={stats.imposterWins}
                    icon={Trophy}
                    color="red"
                    subValue={`${stats.additionalStats?.imposterWinsByCrisis} by Crisis`}
                />
                <StatCard
                    label="Top Player"
                    value={stats.topPlayer?.name || '---'}
                    icon={Users}
                    color="cyan"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Kills', value: stats.additionalStats?.kills, icon: Skull },
                    { label: 'Tasks Done', value: stats.additionalStats?.tasksCompleted, icon: CheckCircle2 },
                    { label: 'Meetings', value: stats.additionalStats?.emergencyMeetings, icon: MessageSquare },
                    { label: 'Bodies', value: stats.additionalStats?.bodiesReported, icon: Search },
                ].map((item: any) => (
                    <div key={item.label} className="bg-glass rounded-2xl p-4 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                        <div>
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</div>
                            <div className="text-xl font-black text-white">{item.value?.toLocaleString() || '0'}</div>
                        </div>
                        <item.icon className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 amongus-card bg-glass min-h-[400px]">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-crewmate rounded-full" />
                        Win Distribution
                    </h2>
                    {/* Pie Chart logic would go here */}
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-3xl">
                        <div className="text-gray-500 mb-4">Win Ratio Visual</div>
                        <div className="flex gap-8">
                            <div className="text-center">
                                <div className="text-crewmate text-3xl font-black">{Math.round((stats.crewmateWins / (stats.totalGames || 1)) * 100)}%</div>
                                <div className="text-xs uppercase text-gray-500 font-bold">Crewmate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-imposter text-3xl font-black">{Math.round((stats.imposterWins / (stats.totalGames || 1)) * 100)}%</div>
                                <div className="text-xs uppercase text-gray-500 font-bold">Imposter</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="amongus-card bg-glass">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-accent rounded-full" />
                        Most Played Map
                    </h2>
                    <div className="text-center py-8">
                        <div className="w-24 h-24 bg-white/5 rounded-full mx-auto flex items-center justify-center mb-4 border border-white/10 glow-crewmate">
                            <MapIcon className="w-10 h-10 text-crewmate" />
                        </div>
                        <div className="text-2xl font-black text-white">{stats.mostPlayedMap?.name || '---'}</div>
                        <div className="text-sm text-gray-400 mt-1">{stats.mostPlayedMap?.totalGames || 0} Games Played</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, subValue }: any) {
    const isRed = color === 'red';
    return (
        <div className={`amongus-card group cursor-pointer border-l-4 ${isRed ? 'border-l-imposter' : 'border-l-crewmate'} hover:bg-white/5`}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</div>
                    <div className={`text-4xl font-black ${isRed ? 'text-imposter' : 'text-crewmate'}`}>
                        {value}
                    </div>
                    {subValue && (
                        <div className="text-[10px] text-gray-600 font-bold uppercase mt-1">
                            {subValue}
                        </div>
                    )}
                </div>
                <Icon className={`w-8 h-8 ${isRed ? 'text-imposter/30' : 'text-crewmate/30'} group-hover:scale-110 transition-transform`} />
            </div>
        </div>
    );
}
