"use client";

import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Save, RefreshCw } from "lucide-react";
import { getPlayerImage } from '@/lib/playerUtils';

interface Player {
    name: string;
    // images etc later
}

interface TierBuilderProps {
    initialPlayers: Player[];
}

const TIERS = ["S", "A", "B", "C", "D", "F"];
const TIER_COLORS: Record<string, string> = {
    S: "bg-[#ff7f7f]",
    A: "bg-[#ffbf7f]",
    B: "bg-[#ffdf7f]",
    C: "bg-[#ffff7f]",
    D: "bg-[#bfff7f]",
    F: "bg-[#7fff7f]", // Keeping consistent with the main page logic I used, though unusual
};

export default function TierBuilder({ initialPlayers }: TierBuilderProps) {
    const saveTierList = useMutation(api.tier.saveTierList);

    // State for each tier + unranked bank
    const [tiers, setTiers] = useState<Record<string, Player[]>>({
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        F: [],
        Bank: initialPlayers,
    });

    const [userName, setUserName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState<string>("");

    // Load User ID and Data on Mount
    useEffect(() => {
        // 1. Get or Create User ID
        let storedId = localStorage.getItem("sdmn_tier_user_id");
        if (!storedId) {
            storedId = crypto.randomUUID();
            localStorage.setItem("sdmn_tier_user_id", storedId);
        }
        setUserId(storedId);
    }, []);

    // Correct way to fetch with Convex once we have the ID
    const userTierList = useQuery(api.tier.getUserTierList, userId ? { userId } : "skip");

    useEffect(() => {
        if (userTierList) {
            setUserName(userTierList.userName);
            const savedRankings = userTierList.rankings as Record<string, string>; // name -> tier

            // Reconstruct state
            const newTiers: Record<string, Player[]> = { S: [], A: [], B: [], C: [], D: [], F: [], Bank: [] };

            // Map all initial players to their saved tier or Bank
            initialPlayers.forEach(p => {
                const tier = savedRankings[p.name];
                if (tier && newTiers[tier]) {
                    newTiers[tier].push(p);
                } else {
                    newTiers.Bank.push(p);
                }
            });

            setTiers(newTiers);
        }
    }, [userTierList, initialPlayers]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-white/10 backdrop-blur-md ">
                <input
                    type="text"
                    placeholder="Your Name (for leaderboard)"
                    className="bg-transparent border-b border-white/20 px-4 py-2 outline-none focus:border-cyan-400 font-bold w-64"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <button
                    onClick={async () => {
                        if (!userName) return alert("Please enter a name");
                        setIsSaving(true);
                        // Convert state to map: playerId -> tier
                        const rankings: Record<string, string> = {};
                        TIERS.forEach(t => {
                            tiers[t].forEach(p => {
                                rankings[p.name] = t;
                            });
                        });

                        await saveTierList({ userId, userName, rankings });
                        setIsSaving(false);
                        alert("Saved!");
                    }}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
                >
                    {isSaving ? <RefreshCw className="animate-spin" /> : <Save />}
                    SAVE LIST
                </button>
            </div>

            {/* TIER ROWS */}
            <div className="space-y-4 select-none">
                {TIERS.map(tier => (
                    <TierRow
                        key={tier}
                        tier={tier}
                        players={tiers[tier]}
                        color={TIER_COLORS[tier]}
                        onDrop={(player) => movePlayer(player, tier)}
                    />
                ))}
            </div>

            {/* BANK */}
            <div
                className="mt-12"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    const playerData = e.dataTransfer.getData("player");
                    if (playerData) {
                        movePlayer(JSON.parse(playerData), "Bank");
                    }
                }}
            >
                <h3 className="text-2xl font-bold mb-4 ml-4">Unranked Players</h3>
                <div className="bg-white/5 min-h-[150px] p-4 rounded-xl border border-white/10 flex flex-wrap gap-2 transition-colors hover:bg-white/10">
                    {tiers.Bank.map(p => (
                        <DraggablePlayer key={p.name} player={p} />
                    ))}
                </div>
            </div>
        </div>
    );

    function movePlayer(player: Player, targetTier: string) {
        // Find current tier
        let currentTier = 'Bank';
        for (const t of [...TIERS, 'Bank']) {
            if (tiers[t].find(p => p.name === player.name)) {
                currentTier = t;
                break;
            }
        }

        if (currentTier === targetTier) return;

        setTiers(prev => ({
            ...prev,
            [currentTier]: prev[currentTier].filter(p => p.name !== player.name),
            [targetTier]: [...prev[targetTier], player]
        }));
    }
}

function TierRow({ tier, players, color, onDrop }: { tier: string, players: Player[], color: string, onDrop: (p: Player) => void }) {
    return (
        <div
            className="flex relative group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                const playerData = e.dataTransfer.getData("player");
                if (playerData) {
                    onDrop(JSON.parse(playerData));
                }
            }}
        >
            <div className={`w-16 md:w-32 flex-shrink-0 flex items-center justify-center text-2xl md:text-4xl font-black italic rounded-l-xl ${color} text-black border-y border-l border-white/10`}>
                {tier}
            </div>
            <div className="flex-1 bg-[#1a1a1a] min-h-[100px] p-2 flex flex-wrap gap-2 content-start rounded-r-xl border-y border-r border-white/10 transition-colors group-hover:bg-[#252525]">
                {players.map(p => (
                    <DraggablePlayer key={p.name} player={p} />
                ))}
            </div>
        </div>
    )
}



function DraggablePlayer({ player }: { player: Player }) {
    const image = getPlayerImage(player.name);

    return (
        <motion.div
            layoutId={player.name}
            draggable
            onDragStart={(e) => {
                // @ts-ignore
                e.dataTransfer.setData("player", JSON.stringify(player));
            }}
            className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/10 hover:border-cyan-400 cursor-grab active:cursor-grabbing relative flex-shrink-0 group"
            whileHover={{ scale: 1.05, zIndex: 10 }}
            whileDrag={{ scale: 1.1, zIndex: 20 }}
        >
            <img src={image} alt={player.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-full bg-black/60 text-[10px] text-center p-0.5 font-bold text-white truncate">
                {player.name}
            </div>
        </motion.div>
    )
}
