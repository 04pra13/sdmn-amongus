"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Send, User, MessageSquare, Clock, ShieldAlert } from "lucide-react";

export default function DiscussionsPage() {
    const comments = useQuery(api.community.getComments) || [];
    const postComment = useMutation(api.community.postComment);

    const [text, setText] = useState("");
    const [name, setName] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        let storedId = localStorage.getItem("sdmn_tier_user_id");
        if (!storedId) {
            storedId = crypto.randomUUID();
            localStorage.setItem("sdmn_tier_user_id", storedId);
        }
        setUserId(storedId);

        const storedName = localStorage.getItem("sdmn_user_name");
        if (storedName) setName(storedName);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !name.trim()) return;

        await postComment({ userId, user: name, text });
        setText("");
        localStorage.setItem("sdmn_user_name", name);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="bg-glass rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                        <span className="text-cyan-400 font-bold tracking-widest text-xs">ENCRYPTED CHANNEL</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black italic text-white mb-4">
                        EMERGENCY <span className="text-red-600">MEETING</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl">
                        Discuss the latest impostor plays, share theories, and demand new missions.
                        This is a secure line for the Fan Fleet.
                    </p>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Input Area */}
            <div className="bg-[#111] rounded-2xl border border-white/10 p-6 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-white/5">
                            <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Identify Yourself (Codename)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-transparent border-b border-white/10 px-2 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 font-bold transition-colors w-full md:w-64"
                            maxLength={20}
                        />
                    </div>
                    <div className="relative">
                        <textarea
                            placeholder="What's on your mind, crewmate?"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all min-h-[120px] resize-y"
                        />
                        <button
                            type="submit"
                            disabled={!text.trim() || !name.trim()}
                            className="absolute bottom-4 right-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-bold flex items-center gap-2 transition-all shadow-lg"
                        >
                            <Send className="w-4 h-4" />
                            TRANSMIT
                        </button>
                    </div>
                </form>
            </div>

            {/* Discussion Feed */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                    <h2 className="text-xl font-bold text-white">Recent Transmissions</h2>
                </div>

                {comments.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 italic border border-dashed border-white/10 rounded-2xl">
                        No transmissions received. Be the first to break silence.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((c) => (
                            <div key={c._id} className="bg-[#0b0e14] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/5 flex items-center justify-center flex-shrink-0 font-bold text-gray-400 group-hover:text-cyan-400 transition-colors">
                                        {c.user.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">{c.user}</span>
                                                <span className="text-xs text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">Crewmate</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                                                <Clock className="w-3 h-3" />
                                                {new Date(c.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                                            {c.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
