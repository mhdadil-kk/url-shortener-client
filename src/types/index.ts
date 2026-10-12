export interface User {
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Url {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface AuthResponseData {
  user: User;
  token?: string;
}

export interface UrlsResponseData {
  urls: Url[];
}

export interface SingleUrlResponseData {
  url: Url;
}