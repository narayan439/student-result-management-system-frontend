export interface Recheck {
  recheckId?: number;
  studentId: number;
  subject: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate?: string;
  completionDate?: string;
  notes?: string;
}

export interface RecheckResponse {
  success: boolean;
  message: string;
  data?: Recheck;
  errors?: string[];
}

export interface RecheckListResponse {
  success: boolean;
  message: string;
  data?: Recheck[];
  errors?: string[];
}
