export const TERRAIN_TYPES = {
  URBAN: 'Urban',
  AGRICULTURE: 'Agriculture',
  FOREST: 'Forest',
  WATER: 'Water',
  BARREN: 'Barren',
} as const;

export const TERRAIN_COLORS = {
  [TERRAIN_TYPES.URBAN]: '#ff6b6b',
  [TERRAIN_TYPES.AGRICULTURE]: '#51cf66',
  [TERRAIN_TYPES.FOREST]: '#228be6',
  [TERRAIN_TYPES.WATER]: '#00d9ff',
  [TERRAIN_TYPES.BARREN]: '#ffa500',
} as const;

export const COLOR_PALETTE = {
  background: '#0a0e27',
  surface: '#1a1f3a',
  border: '#2d3a5c',
  primary: '#00d9ff',
  success: '#00ff88',
  warning: '#ffa500',
  error: '#ff6b6b',
  text: '#e0e7ff',
  textSecondary: '#a0aec0',
} as const;

export const MAP_CONFIG = {
  defaultZoom: 4,
  minZoom: 2,
  maxZoom: 18,
  defaultCenter: [40, -95] as [number, number],
  tileServer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors',
} as const;
