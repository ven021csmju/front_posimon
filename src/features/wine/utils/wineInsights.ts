import type { AgingInsight, Wine, WineSommelierView } from '../../../types/wine';

const SWEETNESS_LABELS: Record<number, string> = {
  1: 'Bone Dry',
  2: 'Dry',
  3: 'Off-Dry',
  4: 'Semi-Sweet',
  5: 'Sweet',
};

const PAIRING_BY_TYPE: Record<string, string[]> = {
  red: ['Grilled steak', 'Lamb chops', 'Aged hard cheese', 'Mushroom risotto'],
  white: ['Seafood', 'Goat cheese salad', 'Roast chicken', 'Sushi & sashimi'],
  sparkling: ['Oysters', 'Caviar', 'Celebration canapés', 'Light desserts'],
  rosé: ['Summer salads', 'Grilled prawns', 'Charcuterie', 'Soft cheeses'],
  dessert: ['Foie gras', 'Blue cheese', 'Fruit tarts', 'Dark chocolate'],
};

export function inferSweetness(wine: Wine): number {
  if (wine.sweetness && wine.sweetness >= 1 && wine.sweetness <= 5) {
    return wine.sweetness;
  }
  const type = (wine.wine_type ?? '').toLowerCase();
  const name = wine.name.toLowerCase();
  if (type.includes('dessert') || name.includes('moscato') || name.includes('port')) return 5;
  if (type.includes('sparkling') && name.includes('brut')) return 1;
  if (type.includes('white') || name.includes('riesling')) return 2;
  if (name.includes('rosé') || name.includes('rose')) return 3;
  return 1;
}

export function getAgingInsight(wine: Wine): AgingInsight {
  if (wine.aging_notes) {
    return {
      status: 'peak',
      label: 'Sommelier note',
      window: wine.aging_notes,
      detail: 'Curated aging guidance from our cellar team.',
    };
  }

  const vintage = wine.vintage;
  const currentYear = new Date().getFullYear();
  if (!vintage) {
    return {
      status: 'ready',
      label: 'Ready to enjoy',
      window: 'No vintage specified',
      detail: 'Serve at ideal temperature after brief decanting if red.',
    };
  }

  const age = currentYear - vintage;
  const type = (wine.wine_type ?? 'red').toLowerCase();

  let peakStart = vintage + (type.includes('white') ? 2 : 5);
  let peakEnd = vintage + (type.includes('white') ? 8 : type.includes('sparkling') ? 6 : 18);

  if (type.includes('sparkling')) {
    peakStart = vintage + 1;
    peakEnd = vintage + 8;
  }

  let status: AgingInsight['status'] = 'ready';
  let label = 'Approaching peak';
  if (currentYear < peakStart) {
    status = 'young';
    label = 'Cellar patiently';
  } else if (currentYear <= peakEnd) {
    status = 'peak';
    label = 'At peak now';
  } else if (currentYear <= peakEnd + 5) {
    status = 'mature';
    label = 'Mature & complex';
  } else {
    status = 'mature';
    label = 'Drink soon';
  }

  return {
    status,
    label,
    window: `${peakStart} – ${peakEnd}`,
    detail: `Vintage ${vintage} · ${age} years in bottle`,
  };
}

export function getFoodPairings(wine: Wine): string[] {
  if (wine.food_pairing) {
    return wine.food_pairing.split(',').map((s) => s.trim()).filter(Boolean);
  }

  const type = (wine.wine_type ?? 'red').toLowerCase();
  if (type.includes('white')) return PAIRING_BY_TYPE.white;
  if (type.includes('sparkling')) return PAIRING_BY_TYPE.sparkling;
  if (type.includes('ros')) return PAIRING_BY_TYPE.rosé;
  if (type.includes('dessert')) return PAIRING_BY_TYPE.dessert;
  return PAIRING_BY_TYPE.red;
}

export function buildSommelierView(wine: Wine): WineSommelierView {
  const sweetness = inferSweetness(wine);
  const ml = wine.bottle_size_ml ?? 750;

  return {
    aging: getAgingInsight(wine),
    pairings: getFoodPairings(wine),
    sweetness,
    sweetnessLabel: SWEETNESS_LABELS[sweetness] ?? 'Dry',
    bottleSize: ml >= 1000 ? `${ml / 1000}L` : `${ml} ml`,
    tastingNotes: wine.tasting_notes || wine.description || 'Elegant structure with a long, refined finish.',
  };
}

export function isWineProduct(product: { type?: string; wine_type?: string }): boolean {
  return product.type === 'wine' || !!product.wine_type;
}
