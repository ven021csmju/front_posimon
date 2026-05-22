import type { Product } from './index';

export interface WineGrape {
  id: number;
  name: string;
}

export interface WineRegion {
  id: number;
  name: string;
}

export interface WineWinery {
  id: number;
  name: string;
}

export interface Wine extends Product {
  type?: 'wine' | 'product';
  designation?: string;
  wine_type?: string;
  vintage?: number;
  alcohol?: number;
  description?: string;
  food_pairing?: string;
  sweetness?: number;
  bottle_size_ml?: number;
  tasting_notes?: string;
  aging_notes?: string;
  winery?: WineWinery;
  region?: WineRegion;
  country?: { id: number; name: string };
  grapes?: WineGrape[];
}

export interface AgingInsight {
  status: 'young' | 'ready' | 'peak' | 'mature';
  label: string;
  window: string;
  detail: string;
}

export interface WineSommelierView {
  aging: AgingInsight;
  pairings: string[];
  sweetness: number;
  sweetnessLabel: string;
  bottleSize: string;
  tastingNotes: string;
}
