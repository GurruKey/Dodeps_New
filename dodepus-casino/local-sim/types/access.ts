export interface AdminRole {
  id: string;
  role_group: string;
  level: number | null;
  is_admin: boolean;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminPermission {
  id: string;
  label: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminRolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  allowed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
