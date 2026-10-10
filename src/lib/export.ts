import * as XLSX from 'xlsx';
import { OrderedPane } from '../data/types';

export function exportOrderedPanesToXlsx(
  panes: OrderedPane[],
  fileName: string,
  cuttingMethod: string
) {
  const rows = panes.map((p, idx) => ({
    'Sequence': idx + 1,
    'Pane ID': p.paneDisplayId,
    'Version': p.versionUsed,
    'Order No': p.orderNumber,
    'Customer': p.customerName,
    'Property Address': p.propertyAddress,
    'Room': p.roomName,
    'Window': p.windowLabel,
    'Width (mm)': p.width,
    'Height (mm)': p.height,
    'Shape': p.shape,
    'Colour (RAL)': p.colour,
    'Furniture': p.furniture,
    'Tags': p.tags.join(', '),
    'Cutting Method': p.cuttingMethod,
    'Production Status': p.productionStatus,
    'Price ex VAT (£)': p.chargedPrice,
    'Export Batch': cuttingMethod,
    'Export Date': new Date().toISOString().split('T')[0],
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Production Panes');

  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 24 },
    { wch: 32 }, { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 20 }, { wch: 16 },
    { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 14 }
  ];

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function exportAuditLogToCsv(auditLog: any[], fileName: string) {
  const rows = auditLog.map(a => ({
    'Timestamp': a.timestamp,
    'User': a.user,
    'Entity Type': a.entityType,
    'Entity ID': a.entityId,
    'Action': a.action,
    'Field Changed': a.diff?.field || '',
    'Before Value': a.diff?.before || '',
    'After Value': a.diff?.after || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Log');
  XLSX.writeFile(workbook, `${fileName}.csv`);
}
