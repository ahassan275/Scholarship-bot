const API_BASE_URL = 'http://localhost:8002';

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  conversation_state: string;
  user_profile: {
    field_of_study: string;
    education_level: string;
    gpa: number;
    location: string;
    citizenship: string;
    financial_need: string;
    extracurriculars: string[];
    research_interests: string[];
    career_goals: string;
  };
  message_id: string;
}

export interface ProfileResponse {
  session_id: string;
  user_profile: {
    field_of_study: string;
    education_level: string;
    gpa: number;
    location: string;
    citizenship: string;
    financial_need: string;
    extracurriculars: string[];
    research_interests: string[];
    career_goals: string;
  };
  conversation_state: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

export const api = {
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    const request: ChatRequest = {
      message,
      session_id: sessionId,
    };

    return makeRequest<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getProfile(sessionId: string): Promise<ProfileResponse> {
    return makeRequest<ProfileResponse>(`/profile/${sessionId}`);
  },

  async resetSession(sessionId: string): Promise<{ status: string; message: string }> {
    return makeRequest<{ status: string; message: string }>(`/reset/${sessionId}`, {
      method: 'POST',
    });
  },

  async healthCheck(): Promise<HealthResponse> {
    return makeRequest<HealthResponse>('/health');
  },

  async getSessionStats(): Promise<{
    active_sessions: number;
    total_messages: number;
    session_timeout_hours: number;
  }> {
    return makeRequest('/sessions/stats');
  },
};

export { ApiError };