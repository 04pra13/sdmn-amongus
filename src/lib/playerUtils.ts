export function getPlayerImage(name: string): string {
    const n = name.toLowerCase().trim();

    // Direct matches
    if (n.includes('ksi') || n === 'jj') return '/players/jj.jpg';
    if (n.includes('miniminter') || n === 'simon') return '/players/simon.jpg';
    if (n.includes('zerkaa') || n === 'josh') return '/players/josh.jpg';
    if (n.includes('tbjzl') || n === 'tobi' || n === 'tobi brown') return '/players/tobi.jpg';
    if (n.includes('behzinga') || n === 'ethan') return '/players/ethan.jpg';
    if (n.includes('vikk') || n === 'vik') return '/players/vik.jpg';
    if (n.includes('w2s') || n === 'harry') return '/players/harry.jpg';

    if (n.includes('lazar') || n.includes('lannan')) return '/players/lazarbeam.jpg';
    if (n.includes('lachlan')) return '/players/lachlan.jpg';
    if (n.includes('ginge')) return '/players/ginge.jpg';
    if (n.includes('danny')) return '/players/dannyaarons.jpg';
    if (n.includes('ellum')) return '/players/ellum.jpg';
    if (n.includes('pie') || n.includes('pieface')) return '/players/pieface.jpg';
    if (n.includes('randolph')) return '/players/randolph.jpg';
    if (n.includes('viz')) return '/players/viz.jpg';
    if (n.includes('deji')) return '/players/deji.jpg';

    // Fallback
    return '/players/others.jpg';
}
