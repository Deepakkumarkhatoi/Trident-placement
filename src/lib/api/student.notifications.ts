import { apiFetch } from './client';

/**
 * Backend response format - what the server actually returns
 */
export interface StudentNotificationDTO {
  id: number;
  driveId: number;
  driveName: string;
  round: string;  // backend returns 'round', not 'roundName'
  statusNotified: 'PASSED' | 'FAILED';  // backend returns statusNotified
  sentAt: string;
  notificationType?: string;
}

/**
 * Frontend internal format - normalized for UI
 */
export interface ShortlistNotification {
  id: number;
  driveId: number;
  driveName: string;
  roundName: string;  // mapped from 'round'
  status: 'PASSED' | 'FAILED';  // mapped from 'statusNotified'
  sentAt: string;
  message?: string;
}

/**
 * Convert backend format to frontend format
 */
function mapNotification(dto: any): ShortlistNotification {
  console.log('🔍 DTO structure:', dto);
  console.log('🔍 Available keys:', Object.keys(dto));
  
  // Try different field names the backend might use
  const status = dto.statusNotified || dto.status_notified || dto.status || 'PASSED';
  const round = dto.round || dto.roundName || '';
  
  console.log('🔍 Resolved status:', status);
  console.log('🔍 Resolved round:', round);

  return {
    id: dto.id,
    driveId: dto.driveId || dto.drive_id,
    driveName: dto.driveName || dto.drive_name || '',
    roundName: round,
    status: status,
    sentAt: dto.sentAt || dto.sent_at || new Date().toISOString(),
    message: `You ${status.toLowerCase()} the ${round.replace(/_/g, ' ')} round in ${dto.driveName || dto.drive_name || 'a drive'}`,
  };
}

export const studentNotificationsApi = {
  /**
   * Fetch all notifications for the current student
   * Note: apiFetch unwraps .data automatically, so we get the array directly
   */
  async getNotifications(): Promise<ShortlistNotification[]> {
    try {
      // apiFetch returns (data.data ?? data), so we get the array directly
      const notificationsData = await apiFetch<StudentNotificationDTO[]>(
        '/api/student/notifications'
      );
      
      console.log('📬 Raw notifications from backend:', notificationsData);
      
      // Map backend DTOs to frontend format
      const mapped = (Array.isArray(notificationsData) ? notificationsData : []).map(mapNotification);
      console.log('📬 Mapped notifications:', mapped);
      
      return mapped;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await apiFetch(`/api/student/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    try {
      await apiFetch('/api/student/notifications/clear', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      throw error;
    }
  },
};
