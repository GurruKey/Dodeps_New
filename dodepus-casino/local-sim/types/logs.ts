export interface AdminLogRow {
  id: string;
  admin_id: string;
  admin_name: string;
  role: string;
  section: string;
  action: string;
  created_at: string | null;
  context?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AdminLogRecord {
  id: string;
  adminId: string;
  adminName: string;
  role: string;
  section: string;
  action: string;
  createdAt: string | null;
  context?: string | null;
  metadata?: Record<string, unknown> | null;
  raw: Readonly<AdminLogRow> | null;
}

export interface AdminLogSnapshot {
  records: ReadonlyArray<AdminLogRecord>;
  byId: ReadonlyMap<string, AdminLogRecord>;
  byAdminId: ReadonlyMap<string, ReadonlyArray<AdminLogRecord>>;
  bySection: ReadonlyMap<string, ReadonlyArray<AdminLogRecord>>;
}
