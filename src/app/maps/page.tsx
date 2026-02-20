'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Map as MapIcon, Gamepad2 } from 'lucide-react';

export default function MapsPage() {
    const [maps, setMaps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/maps')
            .then(res => res.json())
            .then(data => {
                setMaps(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <MapsSkeleton />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl font-black italic tracking-tighter text-white mb-8 flex items-center gap-4">
                <MapIcon className="w-12 h-12 text-cyan-400" />
                MAPS
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {maps.map((map) => (
                    <Link
                        href={`/maps/${encodeURIComponent(map.name)}`}
                        key={map.name}
                        className="group relative block rounded-3xl overflow-hidden aspect-[16/9] border-2 border-white/10 hover:border-cyan-400/50 transition-all duration-300 shadow-2xl"
                    >
                        {/* Background Image */}
                        <Image
                            src={map.image}
                            alt={map.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                            <h2 className="text-4xl font-black italic text-white mb-2">{map.name}</h2>
                            <div className="flex items-center gap-3">
                                <div className="bg-cyan-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-2">
                                    <Gamepad2 className="w-4 h-4 text-cyan-400" />
                                    <span className="font-bold text-cyan-100">{map.count} Games Logged</span>
                                </div>
                            </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                            <MapIcon className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function MapsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[16/9] bg-white/5 rounded-3xl border border-white/5" />
            ))}
        </div>
    );
}
