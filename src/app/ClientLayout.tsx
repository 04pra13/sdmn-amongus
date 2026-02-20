"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            <Sidebar open={open} setOpen={setOpen} />

            <main
                className={`
          flex-1 p-8 transition-all duration-300
          md:ml-64
          ${open ? "ml-64" : "ml-0"}
        `}
            >
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
