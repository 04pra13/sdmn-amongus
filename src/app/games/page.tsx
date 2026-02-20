import type { Metadata } from 'next';
import GameList from './GameList';

export const metadata: Metadata = {
    title: "Mission Archives - Among Us Games | SDMN",
    description: "Browse the chronological archive of all deployed missions and game results.",
    openGraph: {
        title: "Mission Archives - Among Us Games",
        description: "Browse the chronological archive of all deployed missions and game results.",
        images: ["/og-default.jpg"],
    },
};

export default function Page() {
    return <GameList />;
}
