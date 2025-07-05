export type ConversationState = 'profiling' | 'searching' | 'responding' | 'complete';

export interface UserProfile {
  field_of_study: string;
  education_level: string;
  gpa: number;
  location: string;
  citizenship: string;
  financial_need: string;
  extracurriculars: string[];
  research_interests: string[];
  career_goals: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  type?: 'text' | 'scholarship_results' | 'application_support' | 'error';
}

export interface ScholarshipResult {
  name: string;
  amount: string;
  deadline: string;
  eligibility: string;
  source: string;
  url?: string;
}