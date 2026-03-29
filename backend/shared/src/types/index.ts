export interface ServiceConfig {
  port: number;
  serviceName: string;
  dbUrl?: string;
  redisUrl?: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
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

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type AppRole = 'admin' | 'teacher' | 'student';
