import { create } from 'zustand';
import {
  Customer,
  Pane,
  Quote,
  Order,
  OrderedPane,
  AcrylicBatch,
  AuditEntry,
  Note,
  HubSpotContact,
  Coupon,
  ProductionStatus,
  Room,
  Window as SurveyWindow,
} from '../data/types';
import { generateAllCustomersAndPanes } from '../data/generate';
import { seededHubSpotContacts } from '../data/seed/contacts';
import { seededQuotes } from '../data/seed/quotes';
import { seededOrders, seededOrderedPanes } from '../data/seed/orders';
import { seededAcrylicBatches } from '../data/seed/acrylic';
import { seededAuditEntries } from '../data/seed/audit';
import { seededNotes } from '../data/seed/notes';
import { seededCoupons } from '../data/seed/coupons';

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  read: boolean;
  link?: string;
}

export interface DemoSettings {
  simulateWooCommerceError: boolean;
  simulateOmsUnreachable: boolean;
  slowNetwork: boolean;
  emptyData: boolean;
  currentDemoStep: number; // 1 to 7
}

export interface AppState {
  // Data
  customers: Customer[];
  allPanes: Pane[];
  hubspotContacts: HubSpotContact[];
  quotes: Quote[];
  orders: Order[];
  orderedPanes: readonly OrderedPane[]; // Enforced immutability via readonly
  acrylicBatches: AcrylicBatch[];
  auditLog: AuditEntry[];
  notes: Note[];
  coupons: Coupon[];

  // Selection
  selectedPaneIds: Set<string>;
  selectedCustomerId: string | null;

  // Active Pane Drawer
  activeDrawerPaneId: string | null;

  // Edit Mode
  isEditModeUnlocked: boolean;
  editModeExpiresAt: number | null;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;

  // Demo state & guide
  demoSettings: DemoSettings;

  // Actions
  toggleSelectPane: (paneId: string, customerId: string) => void;
  selectPanesBatch: (paneIds: string[], customerId: string, select: boolean) => void;
  clearSelection: () => void;
  openPaneDrawer: (paneId: string) => void;
  closePaneDrawer: () => void;

  unlockEditMode: (password: string) => boolean;
  lockEditMode: () => void;

  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  addNote: (note: Omit<Note, 'id' | 'date'>) => void;
  amendNote: (noteId: string, amendmentText: string) => void;

  updatePaneVersion: (
    paneId: string,
    newWidth: number,
    newHeight: number,
    reason: string
  ) => void;

  bulkUpdatePanes: (
    paneIds: string[],
    field: 'colour' | 'furniture' | 'tags',
    value: any,
    reason: string
  ) => { affectedCount: number; skippedOrderedCount: number };

  saveQuoteDraft: (quoteId: string, draftVersion: string, draftData: any) => void;
  sendQuoteToCustomer: (quoteId: string, recipientEmail: string) => void;
  respondToQuote: (quoteId: string, action: 'accept' | 'query', questionText?: string) => void;

  createWooCommerceOrder: (quoteId: string) => Promise<{ success: boolean; orderNumber?: string; error?: string }>;
  
  updateOrderedPaneStatus: (orderedPaneIds: string[], newStatus: ProductionStatus) => void;
  simulateOmsIncomingUpdate: (orderedPaneId: string, newStatus: ProductionStatus) => void;

  createAcrylicBatch: (paneIds: string[], supplier: string) => string;
  updateAcrylicBatchStatus: (batchId: string, newStatus: 'Draft' | 'Sent' | 'Received') => void;

  commitSurveyIntake: (
    customer: HubSpotContact,
    propertyName: string,
    address: string,
    panes: Array<{
      paneId: string;
      room: string;
      window: string;
      width: number;
      height: number;
      shape: 'Rectangle' | 'Arched' | 'Angled';
      tags: string[];
    }>
  ) => string;

  setDemoStep: (step: number) => void;
  toggleDemoSetting: (key: keyof DemoSettings) => void;
  resetAllDemoState: () => void;
  markNotificationsRead: () => void;
  addNotification: (title: string, description: string, link?: string) => void;
}

function initializeInitialData() {
  const { customers, allPanes } = generateAllCustomersAndPanes();
  return {
    customers,
    allPanes,
    hubspotContacts: seededHubSpotContacts,
    quotes: seededQuotes,
    orders: seededOrders,
    orderedPanes: Object.freeze([...seededOrderedPanes]),
    acrylicBatches: seededAcrylicBatches,
    auditLog: seededAuditEntries,
    notes: seededNotes,
    coupons: seededCoupons,
    notifications: [
      {
        id: 'notif_1',
        timestamp: '2026-10-10T14:20:00Z',
        title: 'Quote QT-2026-0412 accepted',
        description: 'Eleanor Calloway confirmed quotation draft v2 (£1,255.90 ex VAT). Ready for WooCommerce order push.',
        read: false,
        link: '/app/quotes/QT-2026-0412',
      },
      {
        id: 'notif_2',
        timestamp: '2026-10-09T16:45:00Z',
        title: 'Question received on QT-2026-0391',
        description: 'St Aldhelm\'s PCC queried tracery window frosting.',
        read: false,
        link: '/app/quotes/QT-2026-0391',
      },
      {
        id: 'notif_3',
        timestamp: '2026-10-08T09:30:00Z',
        title: 'Quotation sent: QT-2026-0405',
        description: 'Sent by email to Hugh and Imogen Ashdown.',
        read: true,
        link: '/app/quotes/QT-2026-0405',
      },
    ],
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  ...initializeInitialData(),
  selectedPaneIds: new Set<string>(),
  selectedCustomerId: null,
  activeDrawerPaneId: null,

  isEditModeUnlocked: false,
  editModeExpiresAt: null,

  unreadNotificationCount: 2,

  demoSettings: {
    simulateWooCommerceError: false,
    simulateOmsUnreachable: false,
    slowNetwork: false,
    emptyData: false,
    currentDemoStep: 1,
  },

  toggleSelectPane: (paneId: string, customerId: string) => {
    set(state => {
      const newSet = new Set(state.selectedPaneIds);
      let newCustId = state.selectedCustomerId;

      // Reset selection if switching customer
      if (newCustId && newCustId !== customerId) {
        newSet.clear();
      }
      newCustId = customerId;

      if (newSet.has(paneId)) {
        newSet.delete(paneId);
        if (newSet.size === 0) newCustId = null;
      } else {
        newSet.add(paneId);
      }

      return {
        selectedPaneIds: newSet,
        selectedCustomerId: newCustId,
      };
    });
  },

  selectPanesBatch: (paneIds: string[], customerId: string, select: boolean) => {
    set(state => {
      const newSet = new Set(state.selectedPaneIds);
      let newCustId = state.selectedCustomerId;

      if (newCustId && newCustId !== customerId) {
        newSet.clear();
      }
      newCustId = customerId;

      paneIds.forEach(id => {
        if (select) newSet.add(id);
        else newSet.delete(id);
      });

      if (newSet.size === 0) newCustId = null;

      return {
        selectedPaneIds: newSet,
        selectedCustomerId: newCustId,
      };
    });
  },

  clearSelection: () => {
    set({
      selectedPaneIds: new Set<string>(),
      selectedCustomerId: null,
    });
  },

  openPaneDrawer: (paneId: string) => {
    set({ activeDrawerPaneId: paneId });
  },

  closePaneDrawer: () => {
    set({ activeDrawerPaneId: null });
  },

  unlockEditMode: (password: string) => {
    if (password === 'gecko') {
      const expiry = Date.now() + 15 * 60 * 1000; // 15 mins
      set({
        isEditModeUnlocked: true,
        editModeExpiresAt: expiry,
      });
      return true;
    }
    return false;
  },

  lockEditMode: () => {
    set({
      isEditModeUnlocked: false,
      editModeExpiresAt: null,
    });
  },

  addAuditEntry: (entry) => {
    const newEntry: AuditEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    set(state => ({
      auditLog: [newEntry, ...state.auditLog],
    }));
  },

  addNote: (note) => {
    const newNote: Note = {
      id: `note_${Date.now()}`,
      date: new Date().toISOString(),
      ...note,
    };
    set(state => ({
      notes: [newNote, ...state.notes],
    }));
  },

  amendNote: (noteId: string, amendmentText: string) => {
    set(state => ({
      notes: state.notes.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            amendment: {
              author: 'Priya Raman',
              date: new Date().toISOString(),
              text: amendmentText,
            },
          };
        }
        return n;
      }),
    }));
  },

  updatePaneVersion: (paneId, newWidth, newHeight, reason) => {
    const state = get();
    const pane = state.allPanes.find(p => p.id === paneId);
    if (!pane) return;

    const currentVNum = pane.versions.length;
    const newVersionLabel = `${pane.displayId}-${currentVNum + 1}`;
    const deltaMm = Math.abs(newWidth - pane.width) || Math.abs(newHeight - pane.height);

    const newVersionObj = {
      versionNumber: newVersionLabel,
      surveyedDate: new Date().toISOString().split('T')[0],
      surveyor: 'Priya Raman',
      width: newWidth,
      height: newHeight,
      deltaMm,
      reason,
    };

    const updatedVersions = [newVersionObj, ...pane.versions];

    // Update in allPanes and inside customers
    const updatedAllPanes = state.allPanes.map(p => {
      if (p.id === paneId) {
        return {
          ...p,
          width: newWidth,
          height: newHeight,
          currentVersion: newVersionLabel,
          versions: updatedVersions,
        };
      }
      return p;
    });

    const updatedCustomers = state.customers.map(c => {
      if (c.id !== pane.customerId) return c;
      return {
        ...c,
        properties: c.properties.map(prop => ({
          ...prop,
          rooms: prop.rooms.map(r => ({
            ...r,
            windows: r.windows.map(w => ({
              ...w,
              panes: w.panes.map(p => {
                if (p.id === paneId) {
                  return {
                    ...p,
                    width: newWidth,
                    height: newHeight,
                    currentVersion: newVersionLabel,
                    versions: updatedVersions,
                  };
                }
                return p;
              }),
            })),
          })),
        })),
      };
    });

    // Write audit log
    state.addAuditEntry({
      user: 'Priya Raman',
      entityType: 'Measurement',
      entityId: pane.id,
      action: `Created new version ${newVersionLabel} (reason: ${reason})`,
      diff: {
        field: 'Dimensions (mm)',
        before: `${pane.width} × ${pane.height} mm (${pane.currentVersion})`,
        after: `${newWidth} × ${newHeight} mm (${newVersionLabel})`,
      },
    });

    set({
      allPanes: updatedAllPanes,
      customers: updatedCustomers,
    });
  },

  bulkUpdatePanes: (paneIds, field, value, reason) => {
    const state = get();
    let affectedCount = 0;
    let skippedOrderedCount = 0;

    const paneIdSet = new Set(paneIds);

    const updatedAllPanes = state.allPanes.map(p => {
      if (!paneIdSet.has(p.id)) return p;
      if (p.orderedOrderNumbers.length > 0) {
        skippedOrderedCount++;
        return p;
      }
      affectedCount++;
      return {
        ...p,
        [field]: value,
      };
    });

    // Update customers hierarchy
    const updatedCustomers = state.customers.map(c => ({
      ...c,
      properties: c.properties.map(prop => ({
        ...prop,
        rooms: prop.rooms.map(r => ({
          ...r,
          windows: r.windows.map(w => ({
            ...w,
            panes: w.panes.map(p => {
              if (paneIdSet.has(p.id) && p.orderedOrderNumbers.length === 0) {
                return { ...p, [field]: value };
              }
              return p;
            }),
          })),
        })),
      })),
    }));

    state.addAuditEntry({
      user: 'Priya Raman',
      entityType: 'Product assignment',
      entityId: `Bulk: ${affectedCount} panes`,
      action: `Bulk updated ${field} to ${JSON.stringify(value)} (${skippedOrderedCount} ordered panes skipped)`,
    });

    set({
      allPanes: updatedAllPanes,
      customers: updatedCustomers,
    });

    return { affectedCount, skippedOrderedCount };
  },

  saveQuoteDraft: (quoteId, draftVersion, draftData) => {
    set(state => ({
      quotes: state.quotes.map(q => {
        if (q.id === quoteId) {
          return {
            ...q,
            updatedAt: new Date().toISOString(),
            drafts: {
              ...q.drafts,
              [draftVersion]: {
                ...q.drafts[draftVersion],
                ...draftData,
              },
            },
          };
        }
        return q;
      }),
    }));
  },

  sendQuoteToCustomer: (quoteId, recipientEmail) => {
    const state = get();
    const quote = state.quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const updatedDrafts = { ...quote.drafts };
    const currentDraft = updatedDrafts[quote.activeVersion];
    if (currentDraft) {
      currentDraft.status = 'Sent';
      currentDraft.sentAt = new Date().toISOString();
    }

    state.addAuditEntry({
      user: 'Priya Raman',
      entityType: 'Quote',
      entityId: quote.reference,
      action: `Sent quotation ${quote.reference} ${quote.activeVersion} by email to ${recipientEmail}`,
      diff: {
        field: 'Status',
        before: 'Draft',
        after: 'Sent',
      },
    });

    state.addNotification(
      `Quotation ${quote.reference} sent`,
      `Sent to ${recipientEmail} (${quote.customerName})`,
      `/app/quotes/${quote.reference}`
    );

    set(st => ({
      quotes: st.quotes.map(q => {
        if (q.id === quoteId) {
          return {
            ...q,
            status: 'Sent',
            updatedAt: new Date().toISOString(),
            drafts: updatedDrafts,
          };
        }
        return q;
      }),
    }));
  },

  respondToQuote: (quoteId, action, questionText) => {
    const state = get();
    const quote = state.quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const now = new Date().toISOString();
    const updatedDrafts = { ...quote.drafts };
    const currentDraft = updatedDrafts[quote.activeVersion];

    if (action === 'accept') {
      if (currentDraft) {
        currentDraft.status = 'Accepted';
        currentDraft.acceptedAt = now;
      }
      state.addAuditEntry({
        user: `${quote.customerName} (Client Portal)`,
        entityType: 'Quote',
        entityId: quote.reference,
        action: `Accepted quotation ${quote.reference} via email link portal`,
        diff: {
          field: 'Status',
          before: quote.status,
          after: 'Accepted',
        },
      });

      state.addNotification(
        `Quote ${quote.reference} accepted`,
        `${quote.customerName} accepted quote (£${currentDraft?.totalExVat.toFixed(2)} ex VAT)`,
        `/app/quotes/${quote.reference}`
      );
    } else {
      if (currentDraft) {
        currentDraft.status = 'Queried';
        currentDraft.queriedAt = now;
        currentDraft.questionExcerpt = questionText;
      }
      state.addAuditEntry({
        user: `${quote.customerName} (Client Portal)`,
        entityType: 'Quote',
        entityId: quote.reference,
        action: `Queried quotation: "${questionText}"`,
        diff: {
          field: 'Status',
          before: quote.status,
          after: `Queried`,
        },
      });

      state.addNotification(
        `Question on ${quote.reference}`,
        `From ${quote.customerName}: "${questionText?.slice(0, 50)}..."`,
        `/app/quotes/${quote.reference}`
      );
    }

    set(st => ({
      quotes: st.quotes.map(q => {
        if (q.id === quoteId) {
          return {
            ...q,
            status: action === 'accept' ? 'Accepted' : 'Queried',
            updatedAt: now,
            drafts: updatedDrafts,
          };
        }
        return q;
      }),
    }));
  },

  createWooCommerceOrder: async (quoteId) => {
    const state = get();
    const quote = state.quotes.find(q => q.id === quoteId);
    if (!quote) return { success: false, error: 'Quote not found' };

    if (state.demoSettings.simulateWooCommerceError) {
      return { success: false, error: 'WooCommerce API returned HTTP 500: Internal server error. Transaction rolled back.' };
    }

    const orderNum = `WC-${Math.floor(10530 + Math.random() * 20)}`;
    const activeDraft = quote.drafts[quote.activeVersion];
    const quoteLines = activeDraft?.lines || [];

    // Create immutable ordered panes
    const newOrderedPanes: OrderedPane[] = quoteLines.map((line, idx) => ({
      id: `op_${orderNum}_${idx + 1}`,
      paneId: line.paneId,
      paneDisplayId: line.paneDisplayId,
      versionUsed: line.version,
      orderNumber: orderNum,
      customerName: quote.customerName,
      propertyAddress: quote.propertyAddress,
      roomName: line.roomName,
      windowLabel: line.windowLabel,
      width: line.width,
      height: line.height,
      shape: (line.tags.includes('Arched') ? 'Arched' : line.tags.includes('Angled') ? 'Angled' : 'Rectangle') as any,
      colour: line.colour,
      furniture: line.furniture,
      tags: line.tags,
      product: 'Gecko Pane',
      rulePrice: line.rulePrice,
      chargedPrice: line.chargedPrice,
      cuttingMethod: (line.width * line.height > 1800000 || line.tags.includes('Museum Grade') && line.tags.includes('Arched')) ? 'Pane Order' : 'Laser Cut',
      productionStatus: 'Ready to Cut',
      omsLastSync: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const newOrder: Order = {
      id: `ord_${orderNum}`,
      orderNumber: orderNum,
      quoteRef: quote.reference,
      customerId: quote.customerId,
      customerName: quote.customerName,
      propertyAddress: quote.propertyAddress,
      createdAt: new Date().toISOString(),
      totalExVat: activeDraft?.totalExVat || 0,
      paneCount: newOrderedPanes.length,
      lines: newOrderedPanes,
    };

    // Link order number to panes in allPanes & customers
    const orderedPaneIdSet = new Set(quoteLines.map(l => l.paneId));
    const updatedAllPanes = state.allPanes.map(p => {
      if (orderedPaneIdSet.has(p.id)) {
        return {
          ...p,
          orderedOrderNumbers: [...p.orderedOrderNumbers, orderNum],
        };
      }
      return p;
    });

    const updatedCustomers = state.customers.map(c => {
      if (c.id !== quote.customerId) return c;
      return {
        ...c,
        orderedValueExVat: c.orderedValueExVat + (activeDraft?.totalExVat || 0),
        properties: c.properties.map(prop => ({
          ...prop,
          rooms: prop.rooms.map(r => ({
            ...r,
            windows: r.windows.map(w => ({
              ...w,
              panes: w.panes.map(p => {
                if (orderedPaneIdSet.has(p.id)) {
                  return {
                    ...p,
                    orderedOrderNumbers: [...p.orderedOrderNumbers, orderNum],
                  };
                }
                return p;
              }),
            })),
          })),
        })),
      };
    });

    state.addAuditEntry({
      user: 'Priya Raman',
      entityType: 'Ordered pane',
      entityId: orderNum,
      action: `Created WooCommerce order ${orderNum} from quotation ${quote.reference} (${newOrderedPanes.length} panes locked as immutable)`,
    });

    state.addNotification(
      `Order ${orderNum} created`,
      `Pushed ${newOrderedPanes.length} lines to WooCommerce for ${quote.customerName}`,
      `/app/orders`
    );

    // Freezing orderedPanes array enforces immutability
    const frozenNewOrderedPanes = Object.freeze([...newOrderedPanes, ...state.orderedPanes]);

    set(st => ({
      orders: [newOrder, ...st.orders],
      orderedPanes: frozenNewOrderedPanes,
      allPanes: updatedAllPanes,
      customers: updatedCustomers,
    }));

    return { success: true, orderNumber: orderNum };
  },

  updateOrderedPaneStatus: (orderedPaneIds, newStatus) => {
    const state = get();
    const idSet = new Set(orderedPaneIds);

    const updatedList = state.orderedPanes.map(op => {
      if (idSet.has(op.id)) {
        return {
          ...op,
          productionStatus: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return op;
    });

    state.addAuditEntry({
      user: 'Hannah Voss',
      entityType: 'Status',
      entityId: `${orderedPaneIds.length} panes`,
      action: `Status transitioned to ${newStatus}`,
    });

    set({
      orderedPanes: Object.freeze(updatedList),
    });
  },

  simulateOmsIncomingUpdate: (orderedPaneId, newStatus) => {
    const state = get();
    const updatedList = state.orderedPanes.map(op => {
      if (op.id === orderedPaneId) {
        return {
          ...op,
          productionStatus: newStatus,
          omsLastSync: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return op;
    });

    state.addNotification(
      'OMS Status Updated',
      `Line ${orderedPaneId} updated to ${newStatus} from shopfloor OMS`,
      '/app/orders'
    );

    set({
      orderedPanes: Object.freeze(updatedList),
    });
  },

  createAcrylicBatch: (paneIds, supplier) => {
    const state = get();
    const batchNum = `AB-00${32 + state.acrylicBatches.length - 3}`;
    const targetPanes = state.orderedPanes.filter(p => paneIds.includes(p.paneId));
    const totalArea = targetPanes.reduce((acc, p) => acc + (p.width * p.height) / 1000000, 0);

    const newBatch: AcrylicBatch = {
      id: `batch_${batchNum.toLowerCase()}`,
      batchRef: batchNum,
      supplier: supplier || 'Spectrum Acrylics',
      createdAt: new Date().toISOString(),
      status: 'Draft',
      colour: targetPanes[0]?.colour || 'White (RAL 9016)',
      thickness: '3mm',
      paneIds,
      paneCount: targetPanes.length,
      sheetCount: Math.ceil(targetPanes.length / 3.5),
      totalAreaM2: Math.round(totalArea * 100) / 100,
    };

    state.addAuditEntry({
      user: 'Hannah Voss',
      entityType: 'Status',
      entityId: batchNum,
      action: `Created Acrylic Batch ${batchNum} with ${targetPanes.length} panes`,
    });

    set({
      acrylicBatches: [newBatch, ...state.acrylicBatches],
    });

    return batchNum;
  },

  updateAcrylicBatchStatus: (batchId, newStatus) => {
    const state = get();
    const batch = state.acrylicBatches.find(b => b.id === batchId);
    if (!batch) return;

    const updatedBatches = state.acrylicBatches.map(b => {
      if (b.id === batchId) {
        return { ...b, status: newStatus };
      }
      return b;
    });

    // If Received, advance panes to 'Acrylic Received' -> which enables 'Ready to Cut'
    let updatedOrderedPanes = state.orderedPanes;
    if (newStatus === 'Received') {
      const paneIdSet = new Set(batch.paneIds);
      updatedOrderedPanes = Object.freeze(
        state.orderedPanes.map(op => {
          if (paneIdSet.has(op.paneId)) {
            return {
              ...op,
              productionStatus: 'Acrylic Received' as const,
              updatedAt: new Date().toISOString(),
            };
          }
          return op;
        })
      );
    }

    state.addAuditEntry({
      user: 'Hannah Voss',
      entityType: 'Status',
      entityId: batch.batchRef,
      action: `Acrylic batch ${batch.batchRef} marked as ${newStatus}`,
    });

    set({
      acrylicBatches: updatedBatches,
      orderedPanes: updatedOrderedPanes,
    });
  },

  commitSurveyIntake: (contact, propertyName, address, incomingPanes) => {
    const state = get();
    const custId = `cust_intake_${Date.now()}`;
    const propId = `prop_intake_${Date.now()}`;

    // Group panes by room and window
    const roomsMap = new Map<string, Map<string, any[]>>();

    incomingPanes.forEach(p => {
      if (!roomsMap.has(p.room)) roomsMap.set(p.room, new Map());
      const winMap = roomsMap.get(p.room)!;
      if (!winMap.has(p.window)) winMap.set(p.window, []);
      winMap.get(p.window)!.push(p);
    });

    const newRooms: Room[] = [];
    const createdAllPanes: Pane[] = [];

    roomsMap.forEach((winMap, rName) => {
      const roomId = `room_${Date.now()}_${rName.replace(/\s+/g, '')}`;
      const windows: SurveyWindow[] = [];

      winMap.forEach((panesList, wLabel) => {
        const winId = `win_${Date.now()}_${wLabel}`;
        const windowPanes: Pane[] = panesList.map((p, pIdx) => {
          const paneId = `pane_${custId}_${p.paneId}`;
          const ruleP = 175.00; // Resolved price
          const newPane: Pane = {
            id: paneId,
            displayId: p.paneId,
            customerId: custId,
            propertyId: propId,
            roomId,
            roomName: rName,
            windowId: winId,
            windowLabel: wLabel,
            paneIndex: pIdx + 1,
            width: p.width,
            height: p.height,
            shape: p.shape,
            colour: 'White (RAL 9016)',
            furniture: 'Lift-out',
            tags: p.tags,
            product: 'Gecko Pane',
            currentVersion: p.paneId,
            versions: [
              {
                versionNumber: p.paneId,
                surveyedDate: new Date().toISOString().split('T')[0],
                surveyor: 'Daniel Okafor',
                width: p.width,
                height: p.height,
              },
            ],
            rulePrice: ruleP,
            orderedOrderNumbers: [],
          };
          createdAllPanes.push(newPane);
          return newPane;
        });

        windows.push({
          id: winId,
          roomId,
          label: wLabel,
          panes: windowPanes,
        });
      });

      newRooms.push({
        id: roomId,
        propertyId: propId,
        name: rName,
        windows,
      });
    });

    const surveyTotal = createdAllPanes.reduce((acc, p) => acc + p.rulePrice, 0);

    const newCustomer: Customer = {
      id: custId,
      name: contact.name,
      company: contact.company,
      hubspotId: contact.id,
      email: contact.email,
      phone: contact.phone,
      address,
      postcode: contact.postcode,
      surveyValueExVat: surveyTotal,
      orderedValueExVat: 0,
      lastActivity: new Date().toISOString(),
      hasOpenQuote: false,
      properties: [
        {
          id: propId,
          customerId: custId,
          name: propertyName,
          addressLine1: address,
          city: contact.city,
          postcode: contact.postcode,
          rooms: newRooms,
        },
      ],
    };

    state.addAuditEntry({
      user: 'Priya Raman',
      entityType: 'Survey Intake',
      entityId: `${contact.name} / ${propertyName}`,
      action: `Survey intake committed: ${createdAllPanes.length} panes entered under ${propertyName}`,
    });

    state.addNotification(
      'New Survey Committed',
      `${createdAllPanes.length} panes imported for ${contact.name} (${propertyName})`,
      `/app/customers/${custId}`
    );

    set({
      customers: [newCustomer, ...state.customers],
      allPanes: [...createdAllPanes, ...state.allPanes],
    });

    return custId;
  },

  setDemoStep: (step) => {
    set(state => ({
      demoSettings: {
        ...state.demoSettings,
        currentDemoStep: step,
      },
    }));
  },

  toggleDemoSetting: (key) => {
    set(state => ({
      demoSettings: {
        ...state.demoSettings,
        [key]: !state.demoSettings[key],
      },
    }));
  },

  resetAllDemoState: () => {
    const fresh = initializeInitialData();
    set({
      ...fresh,
      selectedPaneIds: new Set<string>(),
      selectedCustomerId: null,
      activeDrawerPaneId: null,
      isEditModeUnlocked: false,
      editModeExpiresAt: null,
      unreadNotificationCount: 2,
      demoSettings: {
        simulateWooCommerceError: false,
        simulateOmsUnreachable: false,
        slowNetwork: false,
        emptyData: false,
        currentDemoStep: 1,
      },
    });
  },

  markNotificationsRead: () => {
    set(state => ({
      unreadNotificationCount: 0,
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    }));
  },

  addNotification: (title, description, link) => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      description,
      read: false,
      link,
    };
    set(state => ({
      notifications: [newNotif, ...state.notifications],
      unreadNotificationCount: state.unreadNotificationCount + 1,
    }));
  },
}));
