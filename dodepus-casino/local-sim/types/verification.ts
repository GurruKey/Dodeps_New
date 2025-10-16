export interface VerificationRequestHistoryRow {
  id: string;
  request_id: string;
  status: string;
  notes: string;
  updated_at: string | null;
  reviewer_id: string | null;
  reviewer_name: string | null;
  reviewer_role: string | null;
  completed_fields: VerificationFieldState;
  requested_fields: VerificationFieldState;
  cleared_fields: VerificationFieldState;
}

export interface VerificationFieldState {
  email: boolean;
  phone: boolean;
  address: boolean;
  doc: boolean;
}

export interface VerificationRequestRow {
  id: string;
  user_id: string;
  status: string;
  submitted_at: string | null;
  updated_at: string | null;
  reviewed_at: string | null;
  reviewer_id: string | null;
  reviewer_name: string | null;
  reviewer_role: string | null;
  notes: string;
  completed_fields: VerificationFieldState;
  requested_fields: VerificationFieldState;
  cleared_fields: VerificationFieldState;
  history?: VerificationRequestHistoryRow[];
  metadata?: Record<string, unknown>;
}

export interface VerificationUploadRow {
  id: string;
  user_id: string;
  request_id: string | null;
  file_name: string | null;
  file_type: string;
  file_url: string | null;
  status: string;
  uploaded_at: string | null;
}

export interface VerificationQueueRow {
  id: string;
  request_id: string | null;
  user_id: string;
  document_type: string;
  status: string;
  submitted_at: string | null;
  priority: 'low' | 'normal' | 'high';
}
