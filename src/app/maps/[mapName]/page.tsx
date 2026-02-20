import type { Metadata } from 'next';
import MapDetailPage from './MapDetail';

type Props = {
    params: Promise<{ mapName: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { mapName } = await params;
    const decodedName = decodeURIComponent(mapName);

    return {
        title: `${decodedName} Map Stats - Among Us | SDMN`,
        description: `Detailed win rates and mission history for the ${decodedName} map on the SDMN Among Us Dashboard.`,
        openGraph: {
            title: `${decodedName} Stats & History`,
            description: `See how often Crewmates vs Imposters win on ${decodedName}.`,
            images: [`/maps/${decodedName.replace(/ /g, '_')}.webp`], // Assumes image mapping logic
        },
    };
}

export default async function Page({ params }: Props) {
    // Pass the promise down to client component which can unwrap it with `use`
    // But wait, client components usually take resolved params or use `useParams()`.
    // The MapDetailPage uses `useParams()` OR `params` prop?
    // Let's check MapDetailPage content again. It takes `{ params }: { params: Promise<{ mapName: string }> }`.
    // So we just pass it through.
    return <MapDetailPage params={params} />;
}
