export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  eligibility: string[];
  documents: string[];
  steps: string[];
  portal_url: string;
  avg_processing_days: number;
}

export interface Scheme {
  id: string;
  title: string;
  category: string;
  description: string;
  eligibility: {
    maxIncome?: number | null;
    minAge?: number | null;
    maxAge?: number | null;
    occupation?: string;
    gender?: string;
    criteriaDescription?: string;
  };
  benefits: string;
  documents: string[];
  targetGroup: string[];
  reasons?: string[]; // returned by recommendation route
  score?: number;     // returned by recommendation route
}

export interface TimelineEvent {
  status: string;
  time: string;
  note: string;
}

export interface Complaint {
  id: string;
  citizen_id: string;
  category: string;
  description: string;
  location_text: string;
  lat?: number | null;
  lng?: number | null;
  photo_url?: string;
  status: 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved';
  created_at: string;
  updated_at: string;
  timeline: TimelineEvent[];
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'bn' | 'mr';
