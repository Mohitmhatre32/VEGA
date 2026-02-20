import { TERRAIN_TYPES } from './constants';

export interface ClassificationResult {
  terrainType: keyof typeof TERRAIN_TYPES;
  confidence: number;
  area: number;
  color: string;
}

export interface AnalyticsDataPoint {
  month: string;
  accuracy: number;
  coverage: number;
  processTime: number;
}

export interface ChangeDetectionData {
  year: number;
  urbanArea: number;
  agricultureArea: number;
  forestArea: number;
  waterArea: number;
  barrenArea: number;
}

export interface BatchResult {
  id: string;
  name: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  terrainBreakdown: ClassificationResult[];
  timestamp: string;
}

// Classification results with confidence scores
export const classificationResults: ClassificationResult[] = [
  {
    terrainType: TERRAIN_TYPES.URBAN,
    confidence: 94.2,
    area: 2847,
    color: '#ff6b6b',
  },
  {
    terrainType: TERRAIN_TYPES.AGRICULTURE,
    confidence: 87.6,
    area: 5234,
    color: '#51cf66',
  },
  {
    terrainType: TERRAIN_TYPES.FOREST,
    confidence: 92.3,
    area: 3891,
    color: '#228be6',
  },
  {
    terrainType: TERRAIN_TYPES.WATER,
    confidence: 98.1,
    area: 1256,
    color: '#00d9ff',
  },
  {
    terrainType: TERRAIN_TYPES.BARREN,
    confidence: 85.4,
    area: 1772,
    color: '#ffa500',
  },
];

// Monthly analytics data
export const analyticsData: AnalyticsDataPoint[] = [
  { month: 'Jan', accuracy: 92, coverage: 78, processTime: 45 },
  { month: 'Feb', accuracy: 93, coverage: 82, processTime: 42 },
  { month: 'Mar', accuracy: 94, coverage: 85, processTime: 40 },
  { month: 'Apr', accuracy: 95, coverage: 88, processTime: 38 },
  { month: 'May', accuracy: 96, coverage: 91, processTime: 35 },
  { month: 'Jun', accuracy: 97, coverage: 94, processTime: 32 },
];

// Change detection year-over-year
export const changeDetectionData: ChangeDetectionData[] = [
  {
    year: 2019,
    urbanArea: 1800,
    agricultureArea: 4200,
    forestArea: 3500,
    waterArea: 950,
    barrenArea: 1550,
  },
  {
    year: 2020,
    urbanArea: 2100,
    agricultureArea: 4400,
    forestArea: 3300,
    waterArea: 1050,
    barrenArea: 1650,
  },
  {
    year: 2021,
    urbanArea: 2350,
    agricultureArea: 4600,
    forestArea: 3100,
    waterArea: 1150,
    barrenArea: 1750,
  },
  {
    year: 2022,
    urbanArea: 2600,
    agricultureArea: 4800,
    forestArea: 2900,
    waterArea: 1200,
    barrenArea: 1850,
  },
  {
    year: 2023,
    urbanArea: 2847,
    agricultureArea: 5234,
    forestArea: 3891,
    waterArea: 1256,
    barrenArea: 1772,
  },
];

// Batch processing results
export const batchResults: BatchResult[] = [
  {
    id: '1',
    name: 'Urban Expansion Analysis 2023',
    status: 'completed',
    progress: 100,
    terrainBreakdown: classificationResults,
    timestamp: '2024-02-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Agricultural Yield Mapping',
    status: 'processing',
    progress: 76,
    terrainBreakdown: classificationResults,
    timestamp: '2024-02-15T11:45:00Z',
  },
  {
    id: '3',
    name: 'Forest Deforestation Track',
    status: 'completed',
    progress: 100,
    terrainBreakdown: classificationResults,
    timestamp: '2024-02-14T14:20:00Z',
  },
  {
    id: '4',
    name: 'Water Quality Assessment',
    status: 'failed',
    progress: 45,
    terrainBreakdown: classificationResults,
    timestamp: '2024-02-14T09:15:00Z',
  },
];

// Global map terrain grid - sample data points
export const mapTerrainPoints = [
  { lat: 40.7128, lng: -74.006, terrain: TERRAIN_TYPES.URBAN, confidence: 94 },
  { lat: 34.0522, lng: -118.2437, terrain: TERRAIN_TYPES.URBAN, confidence: 91 },
  { lat: 41.8781, lng: -87.6298, terrain: TERRAIN_TYPES.URBAN, confidence: 93 },
  { lat: 39.7392, lng: -104.9903, terrain: TERRAIN_TYPES.URBAN, confidence: 89 },
  { lat: 38.2919, lng: -122.2580, terrain: TERRAIN_TYPES.AGRICULTURE, confidence: 87 },
  { lat: 37.7749, lng: -122.4194, terrain: TERRAIN_TYPES.URBAN, confidence: 96 },
  { lat: 47.6062, lng: -122.3321, terrain: TERRAIN_TYPES.FOREST, confidence: 92 },
  { lat: 42.3601, lng: -71.0589, terrain: TERRAIN_TYPES.URBAN, confidence: 88 },
  { lat: 33.7490, lng: -84.3880, terrain: TERRAIN_TYPES.AGRICULTURE, confidence: 85 },
  { lat: 35.0895, lng: -106.6504, terrain: TERRAIN_TYPES.BARREN, confidence: 90 },
];
