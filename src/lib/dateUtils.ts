
/**
 * Format a date string to "Mon DD, YYYY" format (e.g., "Oct 04, 2026")
 * @param input - Date string or Date object
 * @returns Formatted date string or the original input if parsing fails
 */
export function formatApplicationDate(input: string | Date | null | undefined): string {
  if (!input) return '';
  
  try {
    const d = typeof input === 'string' ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) {
      // If standard parsing fails, try custom date formats
      if (typeof input === 'string') {
        return parseCustomDateFormat(input);
      }
      return String(input);
    }
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit'
    });
  } catch {
    return String(input);
  }
}

/**
 * Parse custom date formats that JavaScript's Date constructor might not handle
 * Supports: DD-MM-YYYY, DD-MM-YY, DD/MM/YYYY, DD/MM/YY
 */
function parseCustomDateFormat(dateString: string): string {

  const dmy = dateString.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (dmy) {
    const [_, day, month, year] = dmy;
    const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit'
      });
    }
  }
  
  // Try DD/MM/YYYY or DD/MM/YY format (e.g., "21/04/2026" or "21/04/26")
  const dmySlash = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (dmySlash) {
    const [_, day, month, year] = dmySlash;
    const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit'
      });
    }
  }
  

  return dateString;
}

export function formatDateIndian(input: string | Date | null | undefined): string {
  if (!input) return '';
  
  try {
    const d = typeof input === 'string' ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) {
      if (typeof input === 'string') {
        return parseCustomDateFormat(input);
      }
      return String(input);
    }
    return d.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit'
    });
  } catch {
    return String(input);
  }
}


export function formatDateISO(input: string | Date | null | undefined): string {
  if (!input) return '';
  
  try {
    const d = typeof input === 'string' ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) {
      return String(input);
    }
    return d.toISOString().split('T')[0];
  } catch {
    return String(input);
  }
}


export function isPastDate(input: string | Date | null | undefined): boolean {
  if (!input) return false;
  
  try {
    const d = typeof input === 'string' ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return false;
    return d < new Date();
  } catch {
    return false;
  }
}


export function getDaysRemaining(input: string | Date | null | undefined): number {
  if (!input) return 0;
  
  try {
    const d = typeof input === 'string' ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    
    const diffTime = d.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}
