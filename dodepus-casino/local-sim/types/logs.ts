export interface AdminLogRow {
  id: string;
  admin_id: string;
  admin_name: string;
  role: string;
  section: string;
  action: string;
  created_at: string | null;
  context?: string;
  metadata?: Record<string, unknown>;
}
