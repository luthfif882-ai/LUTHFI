export interface BackupData {
  version: string;
  exportedAt: string;
  app: string;
  data: {
    students?: any[];
    schedules?: any[];
    assignments?: any[];
    announcements?: any[];
    cash_transactions?: any[];
    cash_payments?: any[];
    memories?: any[];
    birthday_messages?: any[];
    class_structure?: any[];
    messages_wall?: any[];
  };
}

export function downloadBackupJSON(backupData: BackupData) {
  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-spi-1a-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateBackupJSON(raw: any): { valid: boolean; error?: string; data?: BackupData } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Format file tidak valid (bukan JSON object).' };
  }
  if (!raw.data || typeof raw.data !== 'object') {
    return { valid: false, error: 'Objek "data" tidak ditemukan di dalam backup.' };
  }
  return { valid: true, data: raw as BackupData };
}
