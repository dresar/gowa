export interface BroadcastSchedule {
  id: string;
  schedule_json: string; // Berisi JSON string: { timestamp, content, metadata }
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface BroadcastRecipient {
  id: string;
  schedule_id: string;
  phone_number: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
}

export interface BroadcastLog {
  id: string;
  schedule_id: string;
  timestamp: string;
  status: 'success' | 'failed';
  message: string;
}

export interface BroadcastPayload {
  timestamp: number;
  content: {
    type: 'text' | 'image' | 'video' | 'document';
    message?: string;
    file_path?: string;
    caption?: string;
  };
  recipients: string[];
  metadata?: Record<string, any>;
}
