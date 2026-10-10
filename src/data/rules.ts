export interface PricingRules {
  effectiveDate: string; // "2026-10-10"
  rulesetLabel: string; // "Price rules as of 10 Oct 2026"
  basePrice: number; // £118.00
  baseAreaThresholdM2: number; // 0.60 m²
  extraAreaRatePerM2: number; // £45.00 per m² above threshold
  shapeSurcharges: {
    Rectangle: number;
    Arched: number; // +£42
    Angled: number; // +£28
  };
  tagSurcharges: {
    Frosted: number; // +£22
    'Museum Grade': number; // +£64
    '3mm': number; // +£14
  };
  colourSurcharges: Record<string, number>;
  furnitureSurcharges: Record<string, number>;
}

export const currentPricingRules: PricingRules = {
  effectiveDate: "2026-10-10",
  rulesetLabel: "Price rules as of 10 Oct 2026",
  basePrice: 118.00,
  baseAreaThresholdM2: 0.60,
  extraAreaRatePerM2: 45.00,
  shapeSurcharges: {
    Rectangle: 0,
    Arched: 42.00,
    Angled: 28.00,
  },
  tagSurcharges: {
    Frosted: 22.00,
    'Museum Grade': 64.00,
    '3mm': 14.00,
  },
  colourSurcharges: {
    'White (RAL 9016)': 0,
    'Heritage Cream (RAL 9001)': 0,
    'Anthracite (RAL 7016)': 12.00,
    'Black (RAL 9005)': 12.00,
    'Bespoke match': 35.00,
  },
  furnitureSurcharges: {
    'Fixed': 0,
    'Lift-out': 14.00,
    'Hinged': 26.00,
    'Sliding (Horizontal)': 32.00,
    'Handle and lock': 18.00,
  },
};
