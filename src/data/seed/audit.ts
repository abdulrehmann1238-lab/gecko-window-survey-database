import { AuditEntry } from '../types';

export const seededAuditEntries: AuditEntry[] = [
  {
    id: 'aud_1',
    timestamp: '2026-10-10T15:48:00Z',
    user: 'Priya Raman',
    entityType: 'Price override',
    entityId: 'QT-2026-0412 / w1p3',
    action: 'Overrode rule price on quotation draft v2',
    diff: {
      field: 'Price',
      before: '£190.00 (Rule)',
      after: '£175.00 (Agreed client discount for matching pair symmetry)',
    },
  },
  {
    id: 'aud_2',
    timestamp: '2026-10-10T14:20:00Z',
    user: 'Eleanor Calloway (Client)',
    entityType: 'Quote',
    entityId: 'QT-2026-0412',
    action: 'Client accepted quotation draft v2 via customer view portal',
    diff: {
      field: 'Status',
      before: 'Sent',
      after: 'Accepted',
    },
  },
  {
    id: 'aud_3',
    timestamp: '2026-10-09T16:45:00Z',
    user: 'Canon Michael Vance (Client)',
    entityType: 'Quote',
    entityId: 'QT-2026-0391',
    action: 'Client submitted query on quotation draft v1',
    diff: {
      field: 'Status',
      before: 'Sent',
      after: 'Queried: "Can the tracery windows be done without frosting in the north aisle?"',
    },
  },
  {
    id: 'aud_4',
    timestamp: '2026-10-08T09:30:00Z',
    user: 'Priya Raman',
    entityType: 'Quote',
    entityId: 'QT-2026-0405',
    action: 'Sent quotation draft v1 by email to Hugh and Imogen Ashdown',
    diff: {
      field: 'Status',
      before: 'Draft',
      after: 'Sent',
    },
  },
  {
    id: 'aud_5',
    timestamp: '2026-10-07T11:15:00Z',
    user: 'Hannah Voss',
    entityType: 'Status',
    entityId: 'AB-0030',
    action: 'Marked acrylic supplier batch as Sent to Spectrum Acrylics',
    diff: {
      field: 'Batch Status',
      before: 'Draft',
      after: 'Sent (18 panes / 6 sheets)',
    },
  },
  {
    id: 'aud_6',
    timestamp: '2026-03-12T10:14:00Z',
    user: 'Daniel Okafor',
    entityType: 'Measurement',
    entityId: 'pane_cal_w1p3',
    action: 'Re-measured reveal dimension; created version w1p3-2',
    diff: {
      field: 'Dimensions (mm)',
      before: '1,181 × 860 mm (w1p3)',
      after: '1,184 × 862 mm (w1p3-2, +3mm taper delta)',
    },
  },
  {
    id: 'aud_7',
    timestamp: '2026-03-04T15:20:00Z',
    user: 'Daniel Okafor',
    entityType: 'Survey Intake',
    entityId: 'cust_calloway / 14 Pelham Crescent',
    action: 'Survey intake workbook committed: 38 panes imported',
    diff: {
      field: 'Intake State',
      before: 'Uploaded XLSX',
      after: '38 panes committed to database',
    },
  },
  ...Array.from({ length: 193 }, (_, i) => {
    const users = ['Priya Raman', 'Daniel Okafor', 'Hannah Voss', 'Marcus Doyle'];
    const types: AuditEntry['entityType'][] = [
      'Measurement', 'Product assignment', 'Quote', 'Ordered pane', 'Price override', 'Status'
    ];
    const u = users[i % users.length];
    const t = types[i % types.length];
    const day = 1 + (i % 28);
    const month = (i % 8) + 2;
    const hour = 8 + (i % 10);
    const minute = 10 + (i % 49);
    const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`;
    return {
      id: `aud_${i + 8}`,
      timestamp: dateStr,
      user: u,
      entityType: t,
      entityId: `WC-104${(i % 50) + 1} / w${(i % 3) + 1}p${(i % 4) + 1}`,
      action: `System audit: ${t} confirmed in production sequence #${i + 8}`,
      diff: {
        field: t === 'Measurement' ? 'Width (mm)' : t === 'Status' ? 'Production Stage' : 'Specification',
        before: t === 'Status' ? 'Awaiting Acrylic' : 'Standard spec',
        after: t === 'Status' ? 'Acrylic Received' : 'Verified by surveyor',
      },
    };
  }),
];
