import type { Metadata } from 'next';
import PlayerProfilePage from './PlayerProfile';

type Props = {
    params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    // Attempt to fetch player data for rich metadata
    // In a real app we'd fetch from DB directly or API
    // Here we'll stick to basic formatting to avoid build-time fetch issues if API isn't ready

    return {
        title: `${decodedName} - Among Us Stats | SDMN`,
        description: `View ${decodedName}'s impostor win rate, crewmate stats, and mission history on the SDMN Among Us Dashboard.`,
        openGraph: {
            title: `${decodedName} - Among Us Stats`,
            description: `Check out ${decodedName}'s stats: Wins, Kills, and detailed role performance.`,
            images: [`/players/${decodedName.toLowerCase()}.jpg`], // Assumes image exists
        },
    };
}

export default function Page() {
    return <PlayerProfilePage />;
}
