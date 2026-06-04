import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines if a drive is active based on its deadline
 * @param lastDate - The deadline date string (e.g., "2024-12-25" or "25-12-2024")
 * @returns true if the deadline has not passed (drive is active), false if deadline has passed (drive is closed)
 */
export function isDriveActive(lastDate: string): boolean {
  try {
    let deadline: Date;
    
    if (lastDate.includes('-')) {
      const parts = lastDate.split('-');
      if (parts[0].length === 4) {
        deadline = new Date(lastDate);
      } else {

        let year = parseInt(parts[2], 10);

        if (year < 100) {
          year += 2000;
        }
        deadline = new Date(`${year}-${parts[1]}-${parts[0]}`);
      }
    } else {
      deadline = new Date(lastDate);
    }

  
    deadline.setHours(23, 59, 59, 999);

    const now = new Date();
    return now <= deadline;
  } catch (error) {
    console.error('Error parsing date:', lastDate, error);

    return true;
  }
}

/**
 * Gets the display status label for a drive based on deadline
 * @param lastDate - The deadline date string
 * @returns "ACTIVE" if drive is active, "CLOSED" if deadline has passed
 */
export function getDriveStatusLabel(lastDate: string): 'ACTIVE' | 'CLOSED' {
  return isDriveActive(lastDate) ? 'ACTIVE' : 'CLOSED';
}
