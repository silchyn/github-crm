import axios, { AxiosResponse } from 'axios';
import { GitHubRepository } from '../models/Project';

/**
 * GitHub API service for fetching repository data
 */
export class GitHubService {
  private static readonly BASE_URL = process.env.GITHUB_API_URL || 'https://api.github.com';
  private static readonly TIMEOUT = 10000; // 10 seconds

  /**
   * Fetch repository data from GitHub API
   * @param owner - Repository owner (e.g., 'facebook')
   * @param repo - Repository name (e.g., 'react')
   * @returns Promise<GitHubRepository | null>
   */
  static async getRepository(owner: string, repo: string): Promise<GitHubRepository | null> {
    try {
      const url = `${this.BASE_URL}/repos/${owner}/${repo}`;

      const response: AxiosResponse<GitHubRepository> = await axios.get(url, {
        timeout: this.TIMEOUT,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-CRM-System'
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Repository '${owner}/${repo}' not found`);
        } else if (error.response?.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        } else if (error.response?.status && error.response.status >= 500) {
          throw new Error('GitHub API is currently unavailable. Please try again later.');
        } else {
          throw new Error(`GitHub API error: ${error.response?.statusText || error.message}`);
        }
      }
      throw new Error(`Failed to fetch repository data: ${error}`);
    }
  }

  /**
   * Parse repository path and extract owner and repo name
   * @param repoPath - Repository path (e.g., 'facebook/react')
   * @returns {owner: string, repo: string}
   */
  static parseRepositoryPath(repoPath: string): { owner: string; repo: string } {
    // Remove leading/trailing whitespace and slashes
    const cleanPath = repoPath.trim().replace(/^\/+|\/+$/g, '');

    // Split by slash
    const parts = cleanPath.split('/');

    if (parts.length !== 2) {
      throw new Error('Invalid repository path. Expected format: owner/repository');
    }

    const [owner, repo] = parts;

    if (!owner || !repo) {
      throw new Error('Invalid repository path. Owner and repository name cannot be empty.');
    }

    // Validate that owner and repo contain only valid characters
    const validPattern = /^[a-zA-Z0-9._-]+$/;
    if (!validPattern.test(owner) || !validPattern.test(repo)) {
      throw new Error('Invalid repository path. Owner and repository name can only contain letters, numbers, dots, underscores, and hyphens.');
    }

    return { owner, repo };
  }

  /**
   * Convert GitHub repository data to our project format
   * @param githubRepo - GitHub repository data
   * @returns Project data
   */
  static convertToProjectData(githubRepo: GitHubRepository) {
    // Convert created_at to Unix timestamp
    const created_at_unix = Math.floor(new Date(githubRepo.created_at).getTime() / 1000);

    return {
      owner: githubRepo.owner.login,
      name: githubRepo.name,
      url: githubRepo.html_url,
      stars: githubRepo.stargazers_count,
      forks: githubRepo.forks_count,
      open_issues: githubRepo.open_issues_count,
      created_at_unix
    };
  }

  /**
   * Validate repository path format
   * @param repoPath - Repository path to validate
   * @returns boolean
   */
  static isValidRepositoryPath(repoPath: string): boolean {
    try {
      this.parseRepositoryPath(repoPath);
      return true;
    } catch {
      return false;
    }
  }
}
