import { currentPricingRules, PricingRules } from '../data/rules';
import { PaneShape, CuttingMethod } from '../data/types';

export function resolvePrice(
  pane: {
    width: number;
    height: number;
    shape?: PaneShape;
    colour?: string;
    furniture?: string;
    tags?: string[];
  },
  rules: PricingRules = currentPricingRules
): number {
  const areaM2 = (pane.width * pane.height) / 1_000_000;
  let price = rules.basePrice;

  // Extra area band
  if (areaM2 > rules.baseAreaThresholdM2) {
    const extra = areaM2 - rules.baseAreaThresholdM2;
    price += extra * rules.extraAreaRatePerM2;
  }

  // Shape
  const shape = pane.shape || 'Rectangle';
  if (rules.shapeSurcharges[shape]) {
    price += rules.shapeSurcharges[shape];
  }

  // Tags
  if (pane.tags && Array.isArray(pane.tags)) {
    for (const tag of pane.tags) {
      if (tag === 'Frosted') price += rules.tagSurcharges.Frosted;
      else if (tag === 'Museum Grade') price += rules.tagSurcharges['Museum Grade'];
      else if (tag === '3mm') price += rules.tagSurcharges['3mm'];
    }
  }

  // Colour
  if (pane.colour && rules.colourSurcharges[pane.colour]) {
    price += rules.colourSurcharges[pane.colour];
  }

  // Furniture
  if (pane.furniture && rules.furnitureSurcharges[pane.furniture]) {
    price += rules.furnitureSurcharges[pane.furniture];
  }

  return Math.round(price * 100) / 100;
}

export function resolveCuttingMethod(pane: {
  width: number;
  height: number;
  shape?: PaneShape;
  tags?: string[];
}): CuttingMethod {
  const areaM2 = (pane.width * pane.height) / 1_000_000;
  if (areaM2 > 1.8 || (pane.shape === 'Arched' && pane.tags?.includes('Museum Grade'))) {
    return 'Pane Order';
  }
  return 'Laser Cut';
}

export function calculateSuggestedInstallation(panesCount: number, complexPanesCount: number): {
  days: number;
  fitters: number;
  commuteMins: number;
  access: 'Ground' | 'Upper floor' | 'Scaffold';
  suggestedCost: number;
  rationale: string;
} {
  const fitters = panesCount > 25 ? 2 : 1;
  const days = Math.max(1, Math.ceil((panesCount + complexPanesCount * 0.5) / 12));
  const commuteMins = 90;
  const access: 'Ground' | 'Upper floor' | 'Scaffold' = 'Upper floor';
  
  // Base day rate per fitter: £320/day + travel allowance
  const baseFitterCost = days * fitters * 320;
  const travelCost = (commuteMins / 60) * 40 * days;
  const accessCost = access === 'Upper floor' ? 140 : access === 'Scaffold' ? 350 : 0;
  
  const suggestedCost = Math.round((baseFitterCost + travelCost + accessCost) * 100) / 100;
  const rationale = `${days} days × ${fitters} fitters + ${commuteMins} min commute (${access})`;

  return {
    days,
    fitters,
    commuteMins,
    access,
    suggestedCost,
    rationale,
  };
}

export function calculateSuggestedShipping(panesCount: number, totalWeightKg: number): {
  deliveryType: 'Courier' | 'Pallet' | 'Collection';
  suggestedCost: number;
  rationale: string;
} {
  if (panesCount <= 3 && totalWeightKg < 25) {
    return {
      deliveryType: 'Courier',
      suggestedCost: 45.00,
      rationale: 'Secure dedicated courier (fragile architectural secondary glazing)',
    };
  }
  if (panesCount > 20 || totalWeightKg > 150) {
    return {
      deliveryType: 'Pallet',
      suggestedCost: 195.00,
      rationale: 'Pallet freight with bespoke timber framing & shock absorbers',
    };
  }
  return {
    deliveryType: 'Pallet',
    suggestedCost: 120.00,
    rationale: 'Standard freight pallet delivery with protective crate',
  };
}
