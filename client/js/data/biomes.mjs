// Canonical biome/region data for Farm & Give — single source of truth
// shared by the game client and the art generator (tools/art).
// Must stay dependency-free (no DOM, no import.meta.env).

// Restoration tiers: 0 = degraded, 1 = recovering, 2 = lush
export const TIER_THRESHOLDS = [0, 34, 67]; // score >= threshold => tier

export const BIOMES = [
    {
        id: 'prairie',
        name: 'Prairie Heartland',
        place: 'North America',
        emoji: '🌾',
        unlock: { coins: 0, level: 1 },
        sky: '#aee3f5',
        // Ambient tint laid over the world at each tier (degraded -> lush)
        tint: ['rgba(120,90,50,0.28)', 'rgba(120,100,60,0.12)', 'rgba(0,0,0,0)'],
        ground: [
            { base: '#9c8554', dark: '#7c6840', light: '#b09a66', detail: '#6b5836' },
            { base: '#8fa45c', dark: '#71854a', light: '#a8bb72', detail: '#5e7040' },
            { base: '#7cb150', dark: '#5f9140', light: '#97c968', detail: '#4d7a34' }
        ],
        soil: { base: '#6b4a2e', dark: '#523823', light: '#7d5a3a', wet: '#4a3320' },
        water: { base: '#4f93c4', dark: '#3a76a3', light: '#7ab4d9' },
        tree: { trunk: '#6e4f30', leafLush: '#4e8f3a', leafMid: '#7d9450', dead: '#7a6a55' },
        prop: 'boulder',
        crops: [
            { id: 'corn', name: 'Corn', archetype: 'stalk', color: '#f2c94c', leaf: '#5d9e3f', seedPrice: 8, sellPrice: 18, growMs: 25000, restore: 2, xp: 5 },
            { id: 'wheat', name: 'Wheat', archetype: 'stalk', color: '#e0b25c', leaf: '#b7a45a', seedPrice: 6, sellPrice: 13, growMs: 20000, restore: 2, xp: 4 },
            { id: 'pumpkin', name: 'Pumpkin', archetype: 'vine', color: '#e08a2e', leaf: '#4f8a38', seedPrice: 14, sellPrice: 32, growMs: 40000, restore: 3, xp: 8 },
            { id: 'sunflower', name: 'Sunflower', archetype: 'flower', color: '#f5c33b', leaf: '#5d9e3f', seedPrice: 10, sellPrice: 24, growMs: 30000, restore: 4, xp: 6, native: true }
        ],
        creatures: [
            { id: 'bison', body: 'quad', size: 'big', color: '#6b4a32', accent: '#4a3122' },
            { id: 'bluebird', body: 'bird', color: '#4f86c9', accent: '#e8a64a' }
        ]
    },
    {
        id: 'countryside',
        name: 'Old World Countryside',
        place: 'Europe',
        emoji: '🍇',
        unlock: { coins: 300, level: 3 },
        sky: '#b5e0ef',
        tint: ['rgba(110,95,60,0.28)', 'rgba(110,105,60,0.12)', 'rgba(0,0,0,0)'],
        ground: [
            { base: '#97885e', dark: '#796c48', light: '#ab9c72', detail: '#665b3c' },
            { base: '#83a05e', dark: '#68814a', light: '#9bb876', detail: '#566c3e' },
            { base: '#66ab52', dark: '#4f8a40', light: '#82c46c', detail: '#417334' }
        ],
        soil: { base: '#5f4630', dark: '#473425', light: '#73563c', wet: '#3f2f20' },
        water: { base: '#5a9bc0', dark: '#437ca0', light: '#83bbd8' },
        tree: { trunk: '#5f452c', leafLush: '#3f8a3c', leafMid: '#6f9152', dead: '#6f6353' },
        prop: 'haybale',
        crops: [
            { id: 'carrot', name: 'Carrot', archetype: 'root', color: '#ec8a3c', leaf: '#4f9a3c', seedPrice: 9, sellPrice: 20, growMs: 24000, restore: 2, xp: 5 },
            { id: 'tomato', name: 'Tomato', archetype: 'bush', color: '#d8453a', leaf: '#4a8a38', seedPrice: 12, sellPrice: 27, growMs: 30000, restore: 2, xp: 6 },
            { id: 'grapes', name: 'Grapes', archetype: 'vine', color: '#7b4fa5', leaf: '#558a3f', seedPrice: 18, sellPrice: 42, growMs: 45000, restore: 3, xp: 9, native: true },
            { id: 'lavender', name: 'Lavender', archetype: 'flower', color: '#9a7fd1', leaf: '#6e9460', seedPrice: 11, sellPrice: 26, growMs: 28000, restore: 4, xp: 6 }
        ],
        creatures: [
            { id: 'hedgehog', body: 'quad', size: 'small', color: '#8a6f4f', accent: '#5d4733' },
            { id: 'robin', body: 'bird', color: '#9a6a4a', accent: '#e06a3a' }
        ]
    },
    {
        id: 'terraces',
        name: 'Misty Rice Terraces',
        place: 'Asia',
        emoji: '🌾',
        unlock: { coins: 700, level: 5 },
        sky: '#c2e7e2',
        tint: ['rgba(100,100,70,0.28)', 'rgba(95,110,80,0.12)', 'rgba(0,0,0,0)'],
        ground: [
            { base: '#8f8a5e', dark: '#736e48', light: '#a5a074', detail: '#615c3c' },
            { base: '#74a06a', dark: '#5b8253', light: '#8eb984', detail: '#4a6c44' },
            { base: '#52ab66', dark: '#3f8a50', light: '#6ec483', detail: '#347342' }
        ],
        soil: { base: '#5a4a36', dark: '#43372a', light: '#6e5c44', wet: '#3a3024' },
        water: { base: '#62b3b0', dark: '#479390', light: '#8ed1ce' },
        tree: { trunk: '#705638', leafLush: '#3f9a55', leafMid: '#6e9e62', dead: '#75695a' },
        prop: 'lantern',
        crops: [
            { id: 'rice', name: 'Rice', archetype: 'stalk', color: '#e8dca0', leaf: '#5fae4f', seedPrice: 10, sellPrice: 25, growMs: 26000, restore: 3, xp: 6, native: true },
            { id: 'soybean', name: 'Soybean', archetype: 'bush', color: '#a8c94f', leaf: '#4f8a3c', seedPrice: 12, sellPrice: 28, growMs: 30000, restore: 2, xp: 6 },
            { id: 'bokchoy', name: 'Bok Choy', archetype: 'root', color: '#cfe8b8', leaf: '#3f8a3c', seedPrice: 14, sellPrice: 32, growMs: 32000, restore: 2, xp: 7 },
            { id: 'tea', name: 'Tea', archetype: 'flower', color: '#7fb069', leaf: '#4a7a3a', seedPrice: 16, sellPrice: 38, growMs: 40000, restore: 4, xp: 8 }
        ],
        creatures: [
            { id: 'crane', body: 'bird', color: '#eef2f0', accent: '#d8453a' },
            { id: 'buffalo', body: 'quad', size: 'big', color: '#5a5450', accent: '#3c3835' }
        ]
    },
    {
        id: 'savanna',
        name: 'Golden Savanna',
        place: 'Africa',
        emoji: '🌍',
        unlock: { coins: 1200, level: 8 },
        sky: '#f5d9a8',
        tint: ['rgba(140,90,40,0.30)', 'rgba(130,105,50,0.12)', 'rgba(0,0,0,0)'],
        ground: [
            { base: '#b08d52', dark: '#8f713f', light: '#c6a468', detail: '#785e34' },
            { base: '#b3a05a', dark: '#928147', light: '#c9b872', detail: '#7a6c3b' },
            { base: '#a3b35e', dark: '#84934a', light: '#bcca78', detail: '#6e7c3e' }
        ],
        soil: { base: '#7a5230', dark: '#5d3e24', light: '#90653e', wet: '#523722' },
        water: { base: '#5b9ab8', dark: '#447b96', light: '#84bad2' },
        tree: { trunk: '#6e5232', leafLush: '#6e9440', leafMid: '#90984e', dead: '#84745c' },
        prop: 'termite',
        crops: [
            { id: 'sorghum', name: 'Sorghum', archetype: 'stalk', color: '#c46a3a', leaf: '#7a9a48', seedPrice: 13, sellPrice: 30, growMs: 28000, restore: 3, xp: 7, native: true },
            { id: 'yam', name: 'Yam', archetype: 'root', color: '#c9974f', leaf: '#5d8a40', seedPrice: 15, sellPrice: 35, growMs: 34000, restore: 2, xp: 7 },
            { id: 'watermelon', name: 'Watermelon', archetype: 'vine', color: '#3f8a4a', leaf: '#5d9a4f', seedPrice: 20, sellPrice: 48, growMs: 48000, restore: 3, xp: 10 },
            { id: 'hibiscus', name: 'Hibiscus', archetype: 'flower', color: '#e0527a', leaf: '#4f8a44', seedPrice: 14, sellPrice: 33, growMs: 32000, restore: 4, xp: 7 }
        ],
        creatures: [
            { id: 'meerkat', body: 'quad', size: 'small', color: '#c0a070', accent: '#8a6f48' },
            { id: 'elephant', body: 'quad', size: 'big', color: '#9a948e', accent: '#75706b' }
        ]
    },
    {
        id: 'rainforest',
        name: 'Emerald Rainforest',
        place: 'South America',
        emoji: '🦜',
        unlock: { coins: 2000, level: 11 },
        sky: '#a8dcc8',
        tint: ['rgba(90,90,55,0.30)', 'rgba(70,100,60,0.12)', 'rgba(0,0,0,0)'],
        ground: [
            { base: '#8a7a52', dark: '#6e6140', light: '#a09068', detail: '#5c5136' },
            { base: '#5f9454', dark: '#4a7842', light: '#78ad6c', detail: '#3d6336' },
            { base: '#3f9a4f', dark: '#2f7c3d', light: '#5cb56b', detail: '#266633' }
        ],
        soil: { base: '#54422e', dark: '#3f3223', light: '#68533a', wet: '#372c1f' },
        water: { base: '#4a9a8f', dark: '#377c72', light: '#71bab0' },
        tree: { trunk: '#5d4426', leafLush: '#2e8a44', leafMid: '#5d9450', dead: '#6b5f4d' },
        prop: 'fern',
        crops: [
            { id: 'cacao', name: 'Cacao', archetype: 'bush', color: '#a05c34', leaf: '#2f7a3d', seedPrice: 22, sellPrice: 52, growMs: 50000, restore: 3, xp: 11, native: true },
            { id: 'pineapple', name: 'Pineapple', archetype: 'root', color: '#e8b94a', leaf: '#3f8a44', seedPrice: 18, sellPrice: 42, growMs: 40000, restore: 2, xp: 9 },
            { id: 'papaya', name: 'Papaya', archetype: 'stalk', color: '#f0a04a', leaf: '#3f9a4f', seedPrice: 16, sellPrice: 38, growMs: 36000, restore: 3, xp: 8 },
            { id: 'passionfruit', name: 'Passionfruit', archetype: 'vine', color: '#8a4fa0', leaf: '#3f8a44', seedPrice: 20, sellPrice: 47, growMs: 44000, restore: 4, xp: 10 }
        ],
        creatures: [
            { id: 'macaw', body: 'bird', color: '#d8453a', accent: '#3f6ec9' },
            { id: 'monkey', body: 'quad', size: 'small', color: '#8a6a44', accent: '#5d4730' }
        ]
    },
    {
        id: 'outback',
        name: 'Red Earth Outback',
        place: 'Australia',
        emoji: '🦘',
        unlock: { coins: 3200, level: 14 },
        sky: '#f7d4b0',
        tint: ['rgba(150,70,40,0.30)', 'rgba(135,95,55,0.12)', 'rgba(0,0,0,0)'],
        ground: [
            { base: '#b06a44', dark: '#8f5434', light: '#c68258', detail: '#78462c' },
            { base: '#ad8050', dark: '#8c663e', light: '#c39866', detail: '#755534' },
            { base: '#94a358', dark: '#778445', light: '#aebb70', detail: '#636e3a' }
        ],
        soil: { base: '#7a4630', dark: '#5d3524', light: '#90583e', wet: '#522f22' },
        water: { base: '#5390b3', dark: '#3e7292', light: '#7cb0cd' },
        tree: { trunk: '#8a6248', leafLush: '#7a9a52', leafMid: '#98a05c', dead: '#8a7560' },
        prop: 'spinifex',
        crops: [
            { id: 'macadamia', name: 'Macadamia', archetype: 'bush', color: '#c9a45c', leaf: '#6e8a48', seedPrice: 26, sellPrice: 62, growMs: 54000, restore: 3, xp: 13 },
            { id: 'quandong', name: 'Quandong', archetype: 'bush', color: '#d8533a', leaf: '#7a9a52', seedPrice: 22, sellPrice: 52, growMs: 46000, restore: 3, xp: 11, native: true },
            { id: 'bushtomato', name: 'Bush Tomato', archetype: 'vine', color: '#e0a23a', leaf: '#8a9a58', seedPrice: 19, sellPrice: 45, growMs: 40000, restore: 2, xp: 10 },
            { id: 'kangaroopaw', name: 'Kangaroo Paw', archetype: 'flower', color: '#d8643a', leaf: '#6e8a48', seedPrice: 17, sellPrice: 41, growMs: 36000, restore: 4, xp: 9 }
        ],
        creatures: [
            { id: 'kangaroo', body: 'quad', size: 'big', color: '#b07a52', accent: '#8a5c3c' },
            { id: 'kookaburra', body: 'bird', color: '#bcb4a8', accent: '#5d8ab0' }
        ]
    },
    {
        id: 'tundra',
        name: 'Aurora Tundra',
        place: 'The Arctic',
        emoji: '❄️',
        unlock: { coins: 5000, level: 17 },
        sky: '#cfe3f2',
        tint: ['rgba(80,90,110,0.30)', 'rgba(90,105,115,0.12)', 'rgba(0,0,0,0)'],
        ground: [
            { base: '#9aa0a8', dark: '#7c828c', light: '#b4bac2', detail: '#686e78' },
            { base: '#8ca890', dark: '#708a74', light: '#a6c2aa', detail: '#5c7460' },
            { base: '#7ab088', dark: '#609070', light: '#96cba4', detail: '#4e795c' }
        ],
        soil: { base: '#5c5448', dark: '#454039', light: '#706757', wet: '#3d3830' },
        water: { base: '#6aa6c9', dark: '#5085a8', light: '#93c5e0', frozen: '#c8e0ee' },
        tree: { trunk: '#6e5e48', leafLush: '#4a8a68', leafMid: '#6e947c', dead: '#7c7468' },
        prop: 'icerock',
        crops: [
            { id: 'cloudberry', name: 'Cloudberry', archetype: 'bush', color: '#f0b052', leaf: '#5d8a60', seedPrice: 30, sellPrice: 72, growMs: 58000, restore: 3, xp: 15, native: true },
            { id: 'lingonberry', name: 'Lingonberry', archetype: 'bush', color: '#d84a4a', leaf: '#4a7a55', seedPrice: 26, sellPrice: 62, growMs: 50000, restore: 3, xp: 13 },
            { id: 'arcticwillow', name: 'Arctic Willow', archetype: 'flower', color: '#d8d0c0', leaf: '#6e947c', seedPrice: 22, sellPrice: 54, growMs: 44000, restore: 4, xp: 11 },
            { id: 'saxifrage', name: 'Saxifrage', archetype: 'flower', color: '#c97fd1', leaf: '#5d8a68', seedPrice: 24, sellPrice: 58, growMs: 46000, restore: 4, xp: 12 }
        ],
        creatures: [
            { id: 'arcticfox', body: 'quad', size: 'small', color: '#e8ecf0', accent: '#b8c0c8' },
            { id: 'snowyowl', body: 'bird', color: '#eef0f2', accent: '#8a92a0' }
        ]
    }
];

export const BIOME_ORDER = BIOMES.map(b => b.id);

export function getBiome(id) {
    return BIOMES.find(b => b.id === id);
}

export function getCrop(biomeId, cropId) {
    const biome = getBiome(biomeId);
    return biome && biome.crops.find(c => c.id === cropId);
}

// Restoration tier (0..2) for a 0-100 score
export function tierForScore(score) {
    if (score >= TIER_THRESHOLDS[2]) return 2;
    if (score >= TIER_THRESHOLDS[1]) return 1;
    return 0;
}

// Restoration needed in the PREVIOUS region before this one can be unlocked
export const UNLOCK_RESTORATION = 50;

// Milestones per region: score => reward
export const MILESTONES = [
    { score: 25, coins: 60, label: 'Seedlings of Hope' },
    { score: 50, coins: 150, label: 'Roots Take Hold' },
    { score: 75, coins: 300, label: 'Wild Return' },
    { score: 100, coins: 600, label: 'Fully Rewound' }
];
