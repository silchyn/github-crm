import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import apiService from '../../services/api';
import ProjectCard from './ProjectCard';
import AddProjectForm from './AddProjectForm';

/**
 * Project list component
 */
const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);

  /**
   * Fetch projects from API
   */
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await apiService.getProjects();
      setProjects(response.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add new project
   */
  const handleAddProject = async (repositoryPath: string) => {
    try {
      const response = await apiService.addProject(repositoryPath);
      setProjects(prev => [response.project, ...prev]);
      setShowAddForm(false);
    } catch (err) {
      throw err; // Let AddProjectForm handle the error
    }
  };

  /**
   * Update project data
   */
  const handleUpdateProject = async (id: number) => {
    try {
      const response = await apiService.updateProject(id);
      setProjects(prev =>
        prev.map(project =>
          project.id === id ? response.project : project
        )
      );
    } catch (err) {
      console.error('Failed to update project:', err);
      // You might want to show a toast notification here
    }
  };

  /**
   * Delete project
   */
  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await apiService.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
      // You might want to show a toast notification here
    }
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="project-list">
      <div className="project-list-header">
        <h2>My Projects</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
        >
          Add Project
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showAddForm && (
        <AddProjectForm
          onSubmit={handleAddProject}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Add your first GitHub repository!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdate={handleUpdateProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
