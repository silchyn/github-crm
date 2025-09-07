import React from 'react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Project card component
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate, onDelete }) => {
  /**
   * Format Unix timestamp to readable date
   */
  const formatDate = (unixTimestamp: number): string => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Format number with commas
   */
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <h3 className="project-title">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
          >
            {project.owner}/{project.name}
          </a>
        </h3>
        <div className="project-actions">
          <button
            onClick={() => onUpdate(project.id)}
            className="btn btn-secondary btn-sm"
            title="Update project data"
          >
            Update
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="btn btn-danger btn-sm"
            title="Delete project"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="project-stats">
        <div className="stat">
          <span className="stat-label">Stars:</span>
          <span className="stat-value">{formatNumber(project.stars)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Forks:</span>
          <span className="stat-value">{formatNumber(project.forks)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Open Issues:</span>
          <span className="stat-value">{formatNumber(project.open_issues)}</span>
        </div>
      </div>

      <div className="project-meta">
        <div className="project-owner">
          <span className="meta-label">Owner:</span>
          <span className="meta-value">{project.owner}</span>
        </div>
        <div className="project-created">
          <span className="meta-label">Created:</span>
          <span className="meta-value">{formatDate(project.created_at_unix)}</span>
        </div>
      </div>

      <div className="project-url">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="project-url-link"
        >
          View on GitHub →
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
