/**
 * TypeScript interfaces for the GitHub CRM application
 */

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  owner: string;
  name: string;
  url: string;
  stars: number;
  forks: number;
  open_issues: number;
  created_at_unix: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ProjectsResponse {
  projects: Project[];
  count: number;
}

export interface ProjectResponse {
  project: Project;
}

export interface ApiError {
  error: string;
  details?: string[];
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AddProjectFormData {
  repositoryPath: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
