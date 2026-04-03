export interface WeaveTemplate {
  id: string;
  name: string;
  category: 'basic' | 'twills' | 'satins' | 'patterns';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  width: number;
  height: number;
  pattern: number[][];
  description: string;
  applications: string;
  warpColor?: string;
  weftColor?: string;
}

export const weaveTemplates: WeaveTemplate[] = [
  // BASIC WEAVES
  {
    id: 'plain-weave',
    name: 'Plain Weave',
    category: 'basic',
    difficulty: 'beginner',
    width: 4,
    height: 4,
    pattern: [
      [1, 0, 1, 0],
      [0, 1, 0, 1],
      [1, 0, 1, 0],
      [0, 1, 0, 1]
    ],
    description: 'The most fundamental weave structure. Each warp alternates over and under each weft.',
    applications: 'Muslin, taffeta, canvas, most basic fabrics',
    warpColor: '#000000',
    weftColor: '#ffffff'
  },
  {
    id: 'basket-weave',
    name: 'Basket Weave 2×2',
    category: 'basic',
    difficulty: 'beginner',
    width: 8,
    height: 8,
    pattern: [
      [1, 1, 0, 0, 1, 1, 0, 0],
      [1, 1, 0, 0, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 1, 1],
      [0, 0, 1, 1, 0, 0, 1, 1],
      [1, 1, 0, 0, 1, 1, 0, 0],
      [1, 1, 0, 0, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 1, 1],
      [0, 0, 1, 1, 0, 0, 1, 1]
    ],
    description: 'Plain weave variation where 2 threads act as one, creating a checkerboard pattern.',
    applications: 'Oxford cloth, monk\'s cloth, hopsack',
    warpColor: '#000000',
    weftColor: '#ffffff'
  },
  {
    id: 'rib-weave',
    name: 'Rib Weave 2×1',
    category: 'basic',
    difficulty: 'beginner',
    width: 8,
    height: 8,
    pattern: [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0]
    ],
    description: 'Creates horizontal ribs with pronounced texture.',
    applications: 'Grosgrain ribbon, faille, bengaline',
    warpColor: '#2c5f2d',
    weftColor: '#f5f5dc'
  },

  // TWILLS
  {
    id: 'twill-2-2',
    name: 'Twill 2/2',
    category: 'twills',
    difficulty: 'beginner',
    width: 8,
    height: 8,
    pattern: [
      [1, 1, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 0, 1, 1, 0, 0, 1, 1],
      [1, 0, 0, 1, 1, 0, 0, 1],
      [1, 1, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 0, 1, 1, 0, 0, 1, 1],
      [1, 0, 0, 1, 1, 0, 0, 1]
    ],
    description: 'Creates diagonal lines at 45° angle. Classic balanced twill.',
    applications: 'Denim, chino, gabardine, drill',
    warpColor: '#4169e1',
    weftColor: '#e6f2ff'
  },
  {
    id: 'twill-3-1',
    name: 'Twill 3/1',
    category: 'twills',
    difficulty: 'beginner',
    width: 8,
    height: 8,
    pattern: [
      [1, 1, 1, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 1, 1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 1, 1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 1, 0, 1]
    ],
    description: 'Warp-faced twill with steeper diagonal. Shows more warp color.',
    applications: 'Workwear, outerwear, upholstery',
    warpColor: '#1a1a1a',
    weftColor: '#8b4513'
  },
      {
    id: 'herringbone',
    name: 'Herringbone',
    category: 'twills',
    difficulty: 'intermediate',
    width: 8,
    height: 8,
    pattern: [
    [1, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 0, 0, 1],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 0, 1, 0, 1, 1, 0],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 0, 0, 1],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 0, 1, 0, 1, 1, 0]
    ],
    description: 'Twill that reverses direction, creating a V-shaped zigzag pattern.',
    applications: 'Suiting, coats, upholstery',
    warpColor: '#2f4f4f',
    weftColor: '#d3d3d3'
  },
  {
    id: 'diamond-twill',
    name: 'Diamond Twill',
    category: 'twills',
    difficulty: 'intermediate',
    width: 8,
    height: 8,
    pattern: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0]
    ],
    description: 'Twill lines that change direction to form diamond shapes.',
    applications: 'Damask, decorative fabrics, napkins',
    warpColor: '#8b0000',
    weftColor: '#fff8dc'
  },

  // SATINS
  {
    id: 'satin-5',
    name: 'Satin 5-Shaft',
    category: 'satins',
    difficulty: 'intermediate',
    width: 10,
    height: 10,
    pattern: [
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 1, 0]
    ],
    description: 'Long floats create smooth, lustrous surface with minimal interlacing.',
    applications: 'Satin fabrics, linings, formal wear',
    warpColor: '#ffd700',
    weftColor: '#fffacd'
  },

  // PATTERN WEAVES
  {
    id: 'houndstooth',
    name: 'Houndstooth',
    category: 'patterns',
    difficulty: 'advanced',
    width: 8,
    height: 8,
    pattern: [
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1]
    ],
    description: 'Checks with pointed projections, resembling canine teeth.',
    applications: 'Classic suiting, coats, accessories',
    warpColor: '#000000',
    weftColor: '#ffffff'
  },
  {
    id: 'birds-eye',
    name: 'Bird\'s Eye',
    category: 'patterns',
    difficulty: 'intermediate',
    width: 8,
    height: 8,
    pattern: [
      [1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [1, 1, 1, 0, 0, 1, 1, 1]
    ],
    description: 'Small diamond shapes with a center dot.',
    applications: 'Diaper cloth, toweling, decorative fabrics',
    warpColor: '#4682b4',
    weftColor: '#f0f8ff'
  },
    {
    id: 'honeycomb',
    name: 'Honeycomb',
    category: 'patterns',
    difficulty: 'advanced',
    width: 12,
    height: 12,
    pattern: [
    [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0],
    [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0]
    ],
    description: 'Creates hexagonal cells with a three-dimensional appearance.',
    applications: 'Bath towels, washcloths, thermal blankets',
    warpColor: '#ffffff',
    weftColor: '#c0c0c0'
  },
  {
    id: 'monks-belt',
    name: 'Monk\'s Belt',
    category: 'patterns',
    difficulty: 'advanced',
    width: 8,
    height: 8,
    pattern: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    description: 'Overshot pattern creating thick and thin bars, traditional colonial weaving.',
    applications: 'Decorative towels, table runners, traditional textiles',
    warpColor: '#8b4513',
    weftColor: '#f5deb3'
  }
];

export const templateCategories = {
  basic: { label: 'Basic Weaves', icon: '⬜' },
  twills: { label: 'Twills', icon: '⬈' },
  satins: { label: 'Satins', icon: '✨' },
  patterns: { label: 'Pattern Weaves', icon: '◆' }
} as const;

export function getTemplatesByCategory(category: WeaveTemplate['category']) {
  return weaveTemplates.filter(t => t.category === category);
}

export function getTemplateById(id: string) {
  return weaveTemplates.find(t => t.id === id);
}
