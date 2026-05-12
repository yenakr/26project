export interface AuditLog {
  id: string;
  timestamp: string; // ISO 8601
  displayTime: string; // HH:mm:ss
  actionType: 'select' | 'cancel' | 'replace' | 'restore' | 'update' | 'system';
  category: string;
  fieldPath: string;
  selectionMode: 'single' | 'multi' | 'text';
  label: string;
  value: string;
  status: 'active' | 'cancelled' | 'replaced' | 'restored';
  cancelledAt?: string;
  cancelReason?: string;
  relatedLogId?: string | null;
  source: 'user' | 'system' | 'gps' | 'imported';
}

export function createLogId(): string {
  return 'log_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

export function getCurrentTimeStrings() {
  const now = new Date();
  const timestamp = now.toISOString();
  const displayTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  return { timestamp, displayTime };
}
