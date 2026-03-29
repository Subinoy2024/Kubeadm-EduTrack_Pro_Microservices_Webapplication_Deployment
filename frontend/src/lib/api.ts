/**
 * API Client for EduTrack Pro Microservices Backend
 *
 * This module provides a typed HTTP client that connects the React frontend
 * to the backend API Gateway. It replaces direct Supabase calls with
 * proper REST API calls through the gateway.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadTokens();
  }

  private loadTokens() {
    this.accessToken = localStorage.getItem('edutrack_access_token');
    this.refreshToken = localStorage.getItem('edutrack_refresh_token');
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('edutrack_access_token', accessToken);
    localStorage.setItem('edutrack_refresh_token', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('edutrack_access_token');
    localStorage.removeItem('edutrack_refresh_token');
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    // Handle 401 by trying to refresh token
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
        return retryResponse.json();
      }
    }

    return response.json();
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          this.setTokens(data.data.accessToken, data.data.refreshToken);
          return true;
        }
      }
    } catch {
      // Refresh failed
    }

    this.clearTokens();
    return false;
  }

  // ==================== Auth ====================
  auth = {
    login: (email: string, password: string) =>
      this.request<{ accessToken: string; refreshToken: string; user: any }>('POST', '/auth/login', { email, password }),

    register: (data: { email: string; password: string; full_name: string; role?: string }) =>
      this.request<{ accessToken: string; refreshToken: string; user: any }>('POST', '/auth/register', data),

    logout: () => this.request('POST', '/auth/logout', { refreshToken: this.refreshToken }),

    getMe: () => this.request<any>('GET', '/auth/me'),

    changePassword: (oldPassword: string, newPassword: string) =>
      this.request('PUT', '/auth/change-password', { oldPassword, newPassword }),
  };

  // ==================== Users ====================
  users = {
    getProfile: () => this.request<any>('GET', '/users/profile'),

    updateProfile: (data: { full_name?: string; avatar_url?: string }) =>
      this.request('PUT', '/users/profile', data),

    getAll: (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      return this.request<any[]>('GET', `/users/users?${qs}`);
    },

    getById: (id: string) => this.request<any>('GET', `/users/users/${id}`),

    updateRole: (userId: string, role: string) =>
      this.request('PUT', `/users/users/${userId}/role`, { role }),

    deleteUser: (userId: string) => this.request('DELETE', `/users/users/${userId}`),

    getStats: () => this.request<any>('GET', '/users/stats'),

    search: (query: string) => this.request<any[]>('GET', `/users/search?q=${encodeURIComponent(query)}`),
  };

  // ==================== Courses ====================
  courses = {
    getAll: (params?: { page?: number; limit?: number; subject?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.subject) qs.set('subject', params.subject);
      return this.request<any[]>('GET', `/courses?${qs}`);
    },

    getById: (id: string) => this.request<any>('GET', `/courses/${id}`),

    create: (data: any) => this.request('POST', '/courses', data),

    update: (id: string, data: any) => this.request('PUT', `/courses/${id}`, data),

    delete: (id: string) => this.request('DELETE', `/courses/${id}`),

    enroll: (courseId: string) => this.request('POST', `/courses/${courseId}/enroll`),

    unenroll: (courseId: string) => this.request('DELETE', `/courses/${courseId}/enroll`),

    getMyEnrollments: () => this.request<any[]>('GET', '/courses/my/enrollments'),

    getLessons: (courseId: string) => this.request<any[]>('GET', `/courses/${courseId}/lessons`),

    createLesson: (courseId: string, data: any) => this.request('POST', `/courses/${courseId}/lessons`, data),

    getStats: () => this.request<any>('GET', '/courses/stats/overview'),
  };

  // ==================== Assignments ====================
  assignments = {
    getAll: (params?: { page?: number; subject?: string; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.subject) qs.set('subject', params.subject);
      if (params?.status) qs.set('status', params.status);
      return this.request<any[]>('GET', `/assignments?${qs}`);
    },

    getById: (id: string) => this.request<any>('GET', `/assignments/${id}`),

    create: (data: any) => this.request('POST', '/assignments', data),

    update: (id: string, data: any) => this.request('PUT', `/assignments/${id}`, data),

    delete: (id: string) => this.request('DELETE', `/assignments/${id}`),

    submit: (assignmentId: string, data: { content?: string; file_url?: string }) =>
      this.request('POST', `/assignments/${assignmentId}/submit`, data),

    getSubmissions: (assignmentId: string) =>
      this.request<any[]>('GET', `/assignments/${assignmentId}/submissions`),

    gradeSubmission: (submissionId: string, data: { score: number; feedback: string }) =>
      this.request('PUT', `/assignments/submissions/${submissionId}/grade`, data),

    getMySubmissions: () => this.request<any[]>('GET', '/assignments/my/submissions'),

    getStats: () => this.request<any>('GET', '/assignments/stats/overview'),
  };

  // ==================== Meetings ====================
  meetings = {
    getAll: (params?: { status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      return this.request<any[]>('GET', `/meetings?${qs}`);
    },

    getById: (id: string) => this.request<any>('GET', `/meetings/${id}`),

    create: (data: any) => this.request('POST', '/meetings', data),

    update: (id: string, data: any) => this.request('PUT', `/meetings/${id}`, data),

    delete: (id: string) => this.request('DELETE', `/meetings/${id}`),

    updateStatus: (id: string, status: string) =>
      this.request('PUT', `/meetings/${id}/status`, { status }),

    join: (id: string) => this.request('POST', `/meetings/${id}/join`),

    leave: (id: string) => this.request('POST', `/meetings/${id}/leave`),

    getUpcoming: (limit?: number) => this.request<any[]>('GET', `/meetings/upcoming?limit=${limit || 10}`),

    getStats: () => this.request<any>('GET', '/meetings/stats/overview'),
  };

  // ==================== Recordings ====================
  recordings = {
    getAll: (params?: { page?: number; subject?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.subject) qs.set('subject', params.subject);
      return this.request<any[]>('GET', `/recordings?${qs}`);
    },

    getById: (id: string) => this.request<any>('GET', `/recordings/${id}`),

    create: (data: any) => this.request('POST', '/recordings', data),

    update: (id: string, data: any) => this.request('PUT', `/recordings/${id}`, data),

    delete: (id: string) => this.request('DELETE', `/recordings/${id}`),

    search: (query: string) => this.request<any[]>('GET', `/recordings/search?q=${encodeURIComponent(query)}`),

    recordView: (id: string) => this.request('POST', `/recordings/${id}/view`),

    getStats: () => this.request<any>('GET', '/recordings/stats/overview'),
  };

  // ==================== AI Chat ====================
  chat = {
    getSessions: () => this.request<any[]>('GET', '/chat/sessions'),

    createSession: (data?: { title?: string; subject?: string }) =>
      this.request<any>('POST', '/chat/sessions', data || {}),

    getMessages: (sessionId: string) => this.request<any[]>('GET', `/chat/sessions/${sessionId}`),

    sendMessage: (sessionId: string, content: string) =>
      this.request<{ userMessage: any; assistantMessage: any }>('POST', `/chat/sessions/${sessionId}/messages`, { content }),

    deleteSession: (sessionId: string) => this.request('DELETE', `/chat/sessions/${sessionId}`),

    getSuggestions: () => this.request<any[]>('GET', '/chat/suggestions'),
  };

  // ==================== Notifications ====================
  notifications = {
    getAll: (params?: { page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      return this.request<any[]>('GET', `/notifications?${qs}`);
    },

    getUnreadCount: () => this.request<{ count: number }>('GET', '/notifications/unread-count'),

    markAsRead: (id: string) => this.request('PUT', `/notifications/${id}/read`),

    markAllAsRead: () => this.request('PUT', '/notifications/read-all'),
  };
}

// Singleton instance
export const api = new ApiClient(API_BASE_URL);
export type { ApiResponse };
