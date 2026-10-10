export interface HubSpotContact {
  id: string; // e.g. "HS-4417829"
  name: string;
  company: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  postcode: string;
}

export interface PaneVersion {
  versionNumber: string; // "w1p3" or "w1p3-2"
  surveyedDate: string;
  surveyor: string;
  width: number;
  height: number;
  deltaMm?: number;
  reason?: string;
}

export type PaneShape = 'Rectangle' | 'Arched' | 'Angled';

export interface Pane {
  id: string; // e.g. "pane_calloway_w1p3"
  displayId: string; // e.g. "w1p3"
  customerId: string;
  propertyId: string;
  roomId: string;
  roomName: string;
  windowId: string;
  windowLabel: string;
  paneIndex: number;
  width: number;
  height: number;
  shape: PaneShape;
  colour: string;
  furniture: string;
  tags: string[];
  product: string; // "Gecko Pane"
  currentVersion: string; // "w1p3-2"
  versions: PaneVersion[];
  rulePrice: number;
  orderedOrderNumbers: string[]; // e.g. ["WC-10482"]
  legacy?: boolean;
}

export interface Window {
  id: string;
  roomId: string;
  label: string; // "W1"
  panes: Pane[];
}

export interface Room {
  id: string;
  propertyId: string;
  name: string; // "Drawing Room"
  windows: Window[];
}

export interface Property {
  id: string;
  customerId: string;
  name: string; // "14 Pelham Crescent"
  addressLine1: string;
  city: string;
  postcode: string;
  rooms: Room[];
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  hubspotId: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  properties: Property[];
  surveyValueExVat: number;
  orderedValueExVat: number;
  lastActivity: string;
  hasOpenQuote?: boolean;
}

export interface QuoteLineSnapshot {
  paneId: string;
  paneDisplayId: string;
  version: string;
  roomName: string;
  windowLabel: string;
  width: number;
  height: number;
  colour: string;
  furniture: string;
  tags: string[];
  rulePrice: number;
  chargedPrice: number;
  isOverridden: boolean;
  overrideReason?: string;
  overrideUser?: string;
  overrideTimestamp?: string;
}

export interface InstallationDetails {
  days: number;
  fitters: number;
  commuteMins: number;
  access: 'Ground' | 'Upper floor' | 'Scaffold';
  suggestedCost: number;
  customCost?: number;
  useCustom: boolean;
}

export interface ShippingDetails {
  postcode: string;
  weightKg: number;
  deliveryType: 'Courier' | 'Pallet' | 'Collection';
  suggestedCost: number;
  customCost?: number;
  useCustom: boolean;
}

export interface QuoteDraft {
  version: string; // "v1" or "v2"
  title: string;
  createdAt: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Queried';
  lines: QuoteLineSnapshot[];
  tagsShown: string[]; // e.g. ["Arched", "Angled", "3mm", "Frosted", "Museum Grade"]
  columnsShown: {
    dimensions: boolean;
  };
  couponCode?: string;
  couponDiscount: number;
  installation: InstallationDetails;
  shipping: ShippingDetails;
  panesSubtotal: number;
  totalExVat: number;
  sentAt?: string;
  acceptedAt?: string;
  queriedAt?: string;
  questionExcerpt?: string;
}

export interface Quote {
  id: string;
  reference: string; // "QT-2026-0412"
  customerId: string;
  customerName: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  customerEmail: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Queried';
  activeVersion: string; // "v2"
  drafts: Record<string, QuoteDraft>; // "v1", "v2"
  createdAt: string;
  updatedAt: string;
}

export type CuttingMethod = 'Laser Cut' | 'Pane Order';
export type ProductionStatus = 
  | 'Ready to Cut'
  | 'Awaiting Acrylic'
  | 'Acrylic Received'
  | 'In Production'
  | 'Complete';

export interface OrderedPane {
  id: string;
  paneId: string;
  paneDisplayId: string;
  versionUsed: string; // "w1p3"
  orderNumber: string; // "WC-10482"
  customerName: string;
  propertyAddress: string;
  roomName: string;
  windowLabel: string;
  width: number;
  height: number;
  shape: PaneShape;
  colour: string;
  furniture: string;
  tags: string[];
  product: string;
  rulePrice: number;
  chargedPrice: number;
  cuttingMethod: CuttingMethod;
  productionStatus: ProductionStatus;
  omsLastSync: string;
  updatedAt: string;
  legacy?: boolean;
  batchRef?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // "WC-10482"
  quoteRef: string;
  customerId: string;
  customerName: string;
  propertyAddress: string;
  createdAt: string;
  totalExVat: number;
  paneCount: number;
  lines: OrderedPane[];
}

export interface AcrylicBatch {
  id: string;
  batchRef: string; // "AB-0031"
  supplier: string; // "Spectrum Acrylics"
  createdAt: string;
  status: 'Draft' | 'Sent' | 'Received';
  colour: string;
  thickness: string;
  paneIds: string[];
  paneCount: number;
  sheetCount: number;
  totalAreaM2: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  entityType: 'Measurement' | 'Product assignment' | 'Quote' | 'Ordered pane' | 'Price override' | 'Status' | 'Survey Intake';
  entityId: string;
  action: string;
  diff?: {
    field: string;
    before: string;
    after: string;
  };
}

export interface Note {
  id: string;
  customerId: string;
  propertyId?: string;
  propertyName?: string;
  author: string;
  date: string;
  scope: 'Customer' | 'Property';
  text: string;
  amendment?: {
    author: string;
    date: string;
    text: string;
  };
}

export interface Coupon {
  code: string;
  description: string;
  type: 'percent' | 'fixed';
  amount: number;
  minSpend?: number;
  isValid: boolean;
  invalidReason?: string;
  syncedAt: string;
}
