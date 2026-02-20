export async function fetchSheetData(gid: string) {
    const SHEET_ID = '1g3Esmr1-Z5jt5_mqOv9-f9fvyFezgT_2Z-8G7w5ChSU';
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

    const response = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 mins
    if (!response.ok) throw new Error('Failed to fetch sheet data');

    const csvText = await response.text();
    return parseCSV(csvText);
}

function parseCSV(text: string) {
    if (!text) return [];

    // Robust CSV parser that handles quoted newlines
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote ("")
                currentCell += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
        } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
            currentRow.push(currentCell.trim());
            rows.push(currentRow);
            currentRow = [];
            currentCell = '';
            if (char === '\r') i++; // Skip \n
        } else {
            if (char !== '\r') currentCell += char;
        }
    }

    // Push the last row if it exists
    if (currentRow.length > 0 || currentCell) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
    }

    if (rows.length === 0) return [];

    const headers = rows[0]; // First row is header
    const data = [];

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        // Skip empty rows
        if (values.length <= 1 && !values[0]) continue;

        const entry: any = {};
        headers.forEach((header, index) => {
            // Remove BOM or weird chars from header if present
            const cleanHeader = header.replace(/^[\uFEFF\s]+|[\s]+$/g, '');
            entry[cleanHeader] = values[index];
        });
        data.push(entry);
    }

    return data;
}


export async function getGames() {
    const data = await fetchSheetData('1053703173');
    return data.map((row: any) => ({
        gameNumber: parseInt(row['Game Number']),
        videoUrl: row['Video Link'],
        winner: row['Winner'],
        mapName: row['Map Name'],
        players: parsePlayers(row['Players, Roles and Tasks'])
    }));
}

function parsePlayers(playersStr: string) {
    if (!playersStr) return [];
    // Handles "Name - Role, Name - Role"
    // Handles "Name - Role, Name - Role" OR newline separated
    return playersStr.split(/,|\n/).map(p => {
        const parts = p.split('-');
        const name = parts[0]?.trim();
        const role = parts[1]?.trim();
        return { name, role };
    }).filter(p => p.name); // Filter out empty entries
}

export async function getGlobalStats() {
    const rawData = await fetchSheetData('783570152');

    // Based on the specific layout:
    // Row 0 is the header: Games Played,,Role Name,Wins,,Map Name,Number of Games
    // Row 1: 435,,Crewmate,195,,The Skeld,244

    const stats: any = {
        totalGames: parseInt(rawData[0]?.['Games Played']) || 0,
        crewmateWinsByTasks: parseInt(rawData[3]?.['Games Played']) || 0,
        imposterWinsByCrisis: parseInt(rawData[6]?.['Games Played']) || 0,
        playersVotedOut: parseInt(rawData[9]?.['Games Played']) || 0,
        emergencyMeetings: parseInt(rawData[12]?.['Games Played']) || 0,
        bodiesReported: parseInt(rawData[15]?.['Games Played']) || 0,
        kills: parseInt(rawData[18]?.['Games Played']) || 0,
        totalTasks: parseInt(rawData[21]?.['Games Played']) || 0,
        totalTasksCompleted: parseInt(rawData[24]?.['Games Played']) || 0,
        roleWins: [],
        mapFrequencies: []
    };

    // Roles and Maps are in standard vertical columns
    rawData.forEach((row: any) => {
        if (row['Role Name'] && row['Wins']) {
            stats.roleWins.push({
                name: row['Role Name'],
                wins: parseInt(row['Wins']) || 0
            });
        }
        if (row['Map Name'] && row['Number of Games']) {
            stats.mapFrequencies.push({
                name: row['Map Name'],
                count: parseInt(row['Number of Games']) || 0
            });
        }
    });

    return stats;
}

export async function getPlayerStats() {
    const data = await fetchSheetData('0');
    return data.map((row: any) => ({
        name: row['Name'],
        gamesPlayed: parseInt(row['Games Played']) || 0,
        wins: parseInt(row['Wins']) || 0,
        losses: parseInt(row['Losses']) || 0,
        winRate: parseFloat(row['Win %']) || 0,
        kills: parseInt(row['Kills']) || 0,
        deaths: parseInt(row['Deaths']) || 0,
        kdr: parseFloat(row['KDR']) || 0,
        killsAsImposter: parseInt(row['Kills as Imposter']) || 0,
        killsPerImposterGame: parseFloat(row['Kills Per Imposter Game']) || 0,
        imposterGames: parseInt(row['Imposter Games']) || 0,
        imposterWins: parseInt(row['Imposter Wins']) || 0,
        imposterWinRate: parseFloat(row['Imposter Win %']) || 0,
        crewmateGames: parseInt(row['Crewmate Games']) || 0,
        crewmateWins: parseInt(row['Crewmate Wins']) || 0,
        crewmateWinRate: parseFloat(row['Crewmate Win %']) || 0,
        neutralGames: parseInt(row['Neutral Games']) || 0,
        neutralWins: parseInt(row['Neutral Wins']) || 0,
        neutralWinRate: parseFloat(row['Neutral Win %']) || 0,
        loverGames: parseInt(row['Lover Games']) || 0,
        loverWins: parseInt(row['Lover Wins']) || 0,
        loverWinRate: parseFloat(row['Lover Win %']) || 0,
        totalTasks: parseInt(row['Total Tasks']) || 0,
        tasksCompleted: parseInt(row['Tasks Completed']) || 0,
        taskCompletionRate: parseFloat(row['Task Completion %']) || 0,
        allTasksCompleted: parseInt(row['All Tasks Completed']) || 0,
        votedOut: parseInt(row['Voted out']) || 0,
        emergencyMeetings: parseInt(row['Emergency Meetings']) || 0,
        bodiesReported: parseInt(row['Bodies Reported']) || 0,
        votedOutFirst: parseInt(row['Voted out First']) || 0,
        firstDeathOfGame: parseInt(row['First Death of Game']) || 0,
        deathInFirstRound: parseInt(row['Death in First Round']) || 0,
        disconnected: parseInt(row['Disconnected']) || 0,
        rageQuit: parseInt(row['Rage Quit']) || 0,
        totalAsImposter: parseInt(row['Imposter Games']) || 0,
        totalAsCrewmate: parseInt(row['Crewmate Games']) || 0,
    }));
}

export async function getOverviewStats() {
    const globalStats = await getGlobalStats();
    const players = await getPlayerStats();

    const crewmateWins = globalStats.roleWins.find((r: any) => r.name === 'Crewmate')?.wins || 0;
    const imposterWins = globalStats.roleWins.find((r: any) => r.name === 'Imposter')?.wins || 0;

    const topPlayer = [...players].sort((a, b) => b.gamesPlayed - a.gamesPlayed)[0];
    const mostPlayedMap = globalStats.mapFrequencies.sort((a: any, b: any) => b.count - a.count)[0];

    return {
        totalGames: globalStats.totalGames,
        totalPlayers: players.length,
        imposterWins,
        crewmateWins,
        topPlayer,
        mostPlayedMap: { name: mostPlayedMap?.name, totalGames: mostPlayedMap?.count },
        additionalStats: {
            tasksCompleted: globalStats.totalTasksCompleted,
            emergencyMeetings: globalStats.emergencyMeetings,
            bodiesReported: globalStats.bodiesReported,
            kills: globalStats.kills,
            imposterWinsByCrisis: globalStats.imposterWinsByCrisis,
            crewmateWinsByTasks: globalStats.crewmateWinsByTasks
        }
    };
}

export async function getGameBreakdowns() {
    const rawData = await fetchSheetData('554027446');
    return rawData.map((row: any) => ({
        gameNumber: parseInt(row['Game Number']),
        sequence: parseInt(row['Sequence']),
        primaryPlayer: row['Primary Player'],
        eventType: row['Event Type'],
        secondaryPlayer: row['Secondary Player']
    }));
}

export async function getPlayerGames(playerName: string) {
    const allGames = await getGames();
    const breakdowns = await getGameBreakdowns();

    // Filter games where player participated
    const playerGames = allGames.filter((g: any) =>
        g.players.some((p: any) => p.name.toLowerCase() === playerName.toLowerCase())
    );

    return playerGames.map((game: any) => {
        const playerEntry = game.players.find((p: any) => p.name.toLowerCase() === playerName.toLowerCase());

        // Get specific events for this player in this game
        const gameEvents = breakdowns.filter((b: any) =>
            b.gameNumber === game.gameNumber &&
            (b.primaryPlayer?.toLowerCase() === playerName.toLowerCase() || b.secondaryPlayer?.toLowerCase() === playerName.toLowerCase())
        );

        // Extract YouTube ID for thumbnail
        const videoId = extractYouTubeID(game.videoUrl);
        const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

        return {
            ...game,
            playedRole: playerEntry?.role,
            events: gameEvents,
            thumbnail,
            videoId
        };
    });
}

export function extractYouTubeID(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export async function getKillPermutations() {
    const rawData = await fetchSheetData('1583768346');
    return rawData.map((row: any) => ({
        killer: row['Primary Player'],
        victim: row['Target'],
        count: parseInt(row['Kill Count']) || 0
    }));
}

export async function getImposterCombinations() {
    const rawData = await fetchSheetData('1320392700');
    return rawData.map((row: any) => {
        // "Player1, Player2" or "Player1, Player2, Player3"
        const tearmmates = row['Imposter Combination']?.split(',').map((s: string) => s.trim()) || [];
        return {
            teammates: tearmmates,
            games: parseInt(row['Number of Games']) || 0,
            wins: parseInt(row['Wins']) || 0,
            winRate: parseFloat(row['Win %']) || 0
        };
    });
}
export async function getMaps() {
    const globalStats = await getGlobalStats();
    const mapStats = globalStats.mapFrequencies;

    const mapImages: Record<string, string> = {
        "The Skeld": "/maps/The_Skeld.webp",
        "MIRA HQ": "/maps/MIRA_HQ.webp",
        "Polus": "/maps/Polus.webp",
        "The Airship": "/maps/The_Airship.webp",
        "The Fungle": "/maps/The_Fungle.webp",
        "Bigger Skeld": "/maps/Bigger_Skeld.webp"

    };

    return mapStats.map((m: any) => ({
        name: m.name,
        count: m.count,
        image: mapImages[m.name] || "/maps/error.jpeg"
    }));
}

export async function getMapGames(mapName: string) {
    const allGames = await getGames();

    // normalize names for comparison
    const normalizedMapName = mapName.toLowerCase().replace(/_/g, ' ');

    const mapGames = allGames.filter((g: any) =>
        g.mapName.toLowerCase() === normalizedMapName ||
        g.mapName.toLowerCase() === mapName.toLowerCase()
    );

    return mapGames.map((game: any) => {
        // Extract YouTube ID for thumbnail
        const videoId = extractYouTubeID(game.videoUrl);
        const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

        return {
            ...game,
            videoId,
            thumbnail
        };
    });
}
