import type {
  ApiResponse,
  AuthResponseData,
  UrlsResponseData,
  SingleUrlResponseData,
  User,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class ApiClientError extends Error {
  public statusCode: number;
  public errors?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode: number, errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data.message || `Request failed with status ${res.status}`;
      throw new ApiClientError(errorMessage, res.status, data.errors);
    }

    return data as T;
  } catch (error: unknown) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(
      'Unable to connect to the server. Please check your connection.',
      0
    );
  }
}

export const api = {
  auth: {
    register: (body: { email: string; password: string }) =>
      request<ApiResponse<AuthResponseData>>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    login: (body: { email: string; password: string }) =>
      request<ApiResponse<AuthResponseData>>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    getMe: () =>
      request<ApiResponse<{ user: User }>>('/api/auth/me', {
        method: 'GET',
      }),

    logout: () =>
      request<ApiResponse<void>>('/api/auth/logout', {
        method: 'POST',
      }),
  },
  urls: {
    getAll: () =>
      request<ApiResponse<UrlsResponseData>>('/api/urls', {
        method: 'GET',
      }),

    create: (originalUrl: string) =>
      request<ApiResponse<SingleUrlResponseData>>('/api/urls', {
        method: 'POST',
        body: JSON.stringify({ originalUrl }),
      }),

    delete: (id: string) =>
      request<ApiResponse<void>>(`/api/urls/${id}`, {
        method: 'DELETE',
      }),
  },
};

export { ApiClientError };