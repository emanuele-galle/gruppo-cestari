/**
 * Utility functions for exporting data
 */

type ExportableData = Record<string, string | number | boolean | Date | null | undefined>;

interface ExportOptions {
  filename: string;
  headers?: Record<string, string>; // Map field name to display name
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends ExportableData>(
  data: T[],
  options: ExportOptions
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from the data
  const allKeys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });
  const keys = Array.from(allKeys);

  // Create header row
  const headerRow = keys.map((key) => {
    const displayName = options.headers?.[key] || key;
    return escapeCSVValue(displayName);
  });

  // Create data rows
  const dataRows = data.map((item) => {
    return keys.map((key) => {
      const value = item[key];
      return escapeCSVValue(formatValue(value));
    });
  });

  // Combine all rows
  const csvContent = [headerRow, ...dataRows]
    .map((row) => row.join(','))
    .join('\n');

  // Add BOM for Excel compatibility with UTF-8
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Download the file
  downloadBlob(blob, `${options.filename}.csv`);
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T>(data: T[], options: ExportOptions): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `${options.filename}.json`);
}

/**
 * Format a value for CSV
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Sì' : 'No';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Escape a value for CSV (handles commas, quotes, newlines)
 */
function escapeCSVValue(value: string): string {
  const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r');
  if (needsQuotes) {
    // Escape double quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return value;
}

/**
 * Trigger a file download from a Blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a timestamped filename
 */
export function generateExportFilename(prefix: string): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${prefix}_${date}_${time}`;
}
