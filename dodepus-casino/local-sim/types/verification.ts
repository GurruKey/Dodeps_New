export interface VerificationFieldState {
  email: boolean;
  phone: boolean;
  address: boolean;
  doc: boolean;
}

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

export interface VerificationQueueEntry {
  id: string;
  requestId: string | null;
  userId: string;
  documentType: string;
  status: string;
  submittedAt: string | null;
  priority: 'low' | 'normal' | 'high';
  raw?: VerificationQueueRow | Record<string, unknown>;
}

export interface VerificationQueueSnapshot {
  records: ReadonlyArray<VerificationQueueEntry>;
  byId: Map<string, VerificationQueueEntry>;
  byRequestId: Map<string, ReadonlyArray<VerificationQueueEntry>>;
  byUserId: Map<string, ReadonlyArray<VerificationQueueEntry>>;
}

export interface VerificationReviewer {
  id: string | null;
  name: string;
  role: string;
}

export interface VerificationRequestHistoryEntry {
  id: string;
  requestId: string | null;
  status: string;
  reviewer: VerificationReviewer;
  notes: string;
  updatedAt: string | null;
  completedFields: VerificationFieldState;
  requestedFields: VerificationFieldState;
  clearedFields: VerificationFieldState;
}

export interface VerificationRequestRecord {
  id: string;
  userId: string | null;
  status: string;
  submittedAt: string | null;
  updatedAt: string | null;
  reviewedAt: string | null;
  reviewerId: string | null;
  reviewerName: string;
  reviewerRole: string;
  notes: string;
  completedFields: VerificationFieldState;
  requestedFields: VerificationFieldState;
  clearedFields: VerificationFieldState;
  history: VerificationRequestHistoryEntry[];
  metadata?: Record<string, unknown>;
}

export interface VerificationUploadRecord {
  id: string;
  userId: string | null;
  requestId: string | null;
  fileName: string | null;
  fileType: string;
  fileUrl: string | null;
  status: string;
  uploadedAt: string | null;
}

export interface VerificationDataset {
  requests: ReadonlyArray<VerificationRequestRecord>;
  uploads: ReadonlyArray<VerificationUploadRecord>;
}
