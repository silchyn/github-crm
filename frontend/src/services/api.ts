import axios, { AxiosResponse, AxiosError } from 'axios';
import { AuthResponse, ProjectsResponse, ProjectResponse, ApiError } from '../types';

/**
 * API service for communicating with the backend
 */
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    // Load token from localStorage on initialization
    this.token = localStorage.getItem('token');
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): never {
    if (error.response) {
      // Server responded with error status
      const apiError = error.response.data as ApiError;
      throw new Error(apiError.error || 'An error occurred');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: this.getAuthHeaders(),
        data,
      };

      const response: AxiosResponse<T> = await axios(config);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Authentication endpoints
  async register(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/register', { email, password });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/login', { email, password });
  }

  async getCurrentUser(): Promise<{ user: any }> {
    return this.request<{ user: any }>('GET', '/auth/me');
  }

  // Project endpoints
  async getProjects(): Promise<ProjectsResponse> {
    return this.request<ProjectsResponse>('GET', '/projects');
  }

  async getProject(id: number): Promise<ProjectResponse> {
    return this.request<ProjectResponse>('GET', `/projects/${id}`);
  }

  async addProject(repositoryPath: string): Promise<ProjectResponse> {
    return this.request<ProjectResponse>('POST', '/projects', { repositoryPath });
  }

  async updateProject(id: number): Promise<ProjectResponse> {
    return this.request<ProjectResponse>('PUT', `/projects/${id}`);
  }

  async deleteProject(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>('DELETE', `/projects/${id}`);
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
