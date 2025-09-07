import { pool } from '../config/database';

/**
 * Project model interface
 */
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
  created_at: Date;
  updated_at: Date;
}

/**
 * Project creation interface
 */
export interface CreateProject {
  user_id: number;
  owner: string;
  name: string;
  url: string;
  stars: number;
  forks: number;
  open_issues: number;
  created_at_unix: number;
}

/**
 * GitHub repository data interface
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  owner: {
    login: string;
  };
}

/**
 * Project model class with database operations
 */
export class ProjectModel {
  /**
   * Create a new project
   */
  static async create(projectData: CreateProject): Promise<Project> {
    const { user_id, owner, name, url, stars, forks, open_issues, created_at_unix } = projectData;

    const query = `
      INSERT INTO projects (user_id, owner, name, url, stars, forks, open_issues, created_at_unix)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, user_id, owner, name, url, stars, forks, open_issues, created_at_unix, created_at, updated_at
    `;

    const values = [user_id, owner, name, url, stars, forks, open_issues, created_at_unix];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Get all projects for a user
   */
  static async findByUserId(userId: number): Promise<Project[]> {
    const query = `
      SELECT id, user_id, owner, name, url, stars, forks, open_issues, created_at_unix, created_at, updated_at
      FROM projects
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Get project by ID and user ID
   */
  static async findByIdAndUserId(id: number, userId: number): Promise<Project | null> {
    const query = `
      SELECT id, user_id, owner, name, url, stars, forks, open_issues, created_at_unix, created_at, updated_at
      FROM projects
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  /**
   * Update project data
   */
  static async update(id: number, userId: number, updateData: Partial<CreateProject>): Promise<Project | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return await this.findByIdAndUserId(id, userId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, userId);

    const query = `
      UPDATE projects
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING id, user_id, owner, name, url, stars, forks, open_issues, created_at_unix, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete project
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM projects
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [id, userId]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Check if project exists for user
   */
  static async existsForUser(owner: string, name: string, userId: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM projects
      WHERE owner = $1 AND name = $2 AND user_id = $3
    `;

    const result = await pool.query(query, [owner, name, userId]);
    return result.rows.length > 0;
  }
}
