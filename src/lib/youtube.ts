export async function getLatestAmongUsVideo() {
    const CHANNELS = [
        { name: 'MoreSidemen', id: 'UCh5mLn90vUaB1PbRRx_AiaA' },
        { name: 'Sidemen', id: 'UCDogdKl7t7NHzQ95aEwkdMw' }
    ];

    const allVideos: any[] = [];

    for (const channel of CHANNELS) {
        try {
            const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`, { next: { revalidate: 3600 } });
            if (!res.ok) {
                console.error(`Failed to fetch RSS for ${channel.name}`);
                continue;
            }
            const text = await res.text();

            // Simple regex parsing to avoid heavy XML parsers
            // Matches <entry> blocks
            const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
            let match;

            while ((match = entryRegex.exec(text)) !== null) {
                const entryContent = match[1];

                const titleMatch = entryContent.match(/<title>(.*?)<\/title>/);
                const idMatch = entryContent.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
                const publishedMatch = entryContent.match(/<published>(.*?)<\/published>/);

                if (titleMatch && idMatch && publishedMatch) {
                    const title = titleMatch[1];
                    const videoId = idMatch[1];
                    const publishedAt = publishedMatch[1];

                    // Filter for Among Us
                    if (title.toLowerCase().includes('among us') || title.toLowerCase().includes('amongus')) {
                        allVideos.push({
                            title,
                            videoId,
                            publishedAt,
                            channelName: channel.name,
                            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                            url: `https://www.youtube.com/watch?v=${videoId}`
                        });
                    }
                }
            }

        } catch (error) {
            console.error(`Error fetching ${channel.name} RSS:`, error);
        }
    }

    // Sort by published date descending
    allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return allVideos[0] || null;
}
