import { apiFetch } from './client';


export interface StudentNotificationDTO {
  id: number;
  driveId: number;
  driveName: string;
  round: string;  
  statusNotified: 'PASSED' | 'FAILED';  
  sentAt: string;
  notificationType?: string;
}


export interface ShortlistNotification {
  id: number;
  driveId: number;
  driveName: string;
  roundName: string;  
  status: 'PASSED' | 'FAILED'; 
  sentAt: string;
  message?: string;
}


function mapNotification(dto: any): ShortlistNotification {
  console.log('🔍 DTO structure:', dto);
  console.log('🔍 Available keys:', Object.keys(dto));
  

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

  async getNotifications(): Promise<ShortlistNotification[]> {
    try {
      const notificationsData = await apiFetch<StudentNotificationDTO[]>(
        '/api/student/notifications'
      );
      
      console.log('📬 Raw notifications from backend:', notificationsData);

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
