export function formatGbp(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '£0.00';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-GB').format(val);
}

export function formatDimensions(width: number, height: number): string {
  return `${width.toLocaleString()} × ${height.toLocaleString()} mm`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function timeAgo(isoString: string): string {
  try {
    const d = new Date(isoString).getTime();
    const now = new Date('2026-10-10T17:00:00Z').getTime();
    const diffSecs = Math.max(0, Math.floor((now - d) / 1000));
    
    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    const days = Math.floor(diffSecs / 86400);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  } catch {
    return 'Recently';
  }
}
