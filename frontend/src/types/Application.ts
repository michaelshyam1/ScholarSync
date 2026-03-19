export type Application = {
  id: string;
  user_id: string;
  scholarship_id: string;
  status?: string;
  essay?: string;
  documents?: string[];
  notes?: string;
  form_data?: Record<string, unknown>;
  submitted_at?: string;
  updated_at?: string;
};
