export interface AdminLogRecord {
  id: string;
  adminId: string;
  adminName: string;
  role: string;
  section: string;
  action: string;
  createdAt: string | null;
  context?: string;
  metadata?: Record<string, unknown>;
  raw: Record<string, unknown> | null;
}

export interface AdminLogSnapshot {
  records: ReadonlyArray<AdminLogRecord>;
  byId: ReadonlyMap<string, AdminLogRecord>;
  byAdminId: ReadonlyMap<string, ReadonlyArray<AdminLogRecord>>;
  bySection: ReadonlyMap<string, ReadonlyArray<AdminLogRecord>>;
}
