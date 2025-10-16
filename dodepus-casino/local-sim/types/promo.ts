export interface AdminPromocodeActivationRow {
  id: string;
  client_id?: string | null;
  activated_at: string;
}

export interface AdminPromocodeRow {
  id: string;
  code: string;
  type_id: string;
  title: string;
  reward: string;
  status: string;
  limit: number | null;
  used: number;
  wager: number | null;
  cashout_cap: number | null;
  notes: string;
  params: Record<string, unknown>;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  activations: AdminPromocodeActivationRow[];
}

export interface AdminPromocodeActivationRecord {
  id: string;
  activatedAt: string;
  clientId?: string;
}

export interface AdminPromocodeRecord {
  id: string;
  code: string;
  typeId: string;
  title: string;
  reward: string;
  status: string;
  limit: number | null;
  used: number;
  wager: number | null;
  cashoutCap: number | null;
  notes: string;
  params: Record<string, unknown>;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  activations: AdminPromocodeActivationRecord[];
}
