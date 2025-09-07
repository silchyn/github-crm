import React, { useState } from 'react';
import { AddProjectFormData } from '../../types';

interface AddProjectFormProps {
  onSubmit: (repositoryPath: string) => Promise<void>;
  onCancel: () => void;
}

/**
 * Add project form component
 */
const AddProjectForm: React.FC<AddProjectFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<AddProjectFormData>({
    repositoryPath: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ repositoryPath: value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = (): string | null => {
    const { repositoryPath } = formData;

    if (!repositoryPath.trim()) {
      return 'Repository path is required';
    }

    // Basic validation for owner/repo format
    const parts = repositoryPath.trim().split('/');
    if (parts.length !== 2) {
      return 'Repository path must be in format: owner/repository';
    }

    const [owner, repo] = parts;
    if (!owner || !repo) {
      return 'Owner and repository name cannot be empty';
    }

    // Check for valid characters
    const validPattern = /^[a-zA-Z0-9._-]+$/;
    if (!validPattern.test(owner) || !validPattern.test(repo)) {
      return 'Owner and repository name can only contain letters, numbers, dots, underscores, and hyphens';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit(formData.repositoryPath.trim());
      // Reset form on success
      setFormData({ repositoryPath: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-project-form">
      <h3>Add New Project</h3>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="repositoryPath">GitHub Repository Path</label>
          <input
            type="text"
            id="repositoryPath"
            name="repositoryPath"
            value={formData.repositoryPath}
            onChange={handleChange}
            placeholder="e.g., facebook/react"
            required
            disabled={isLoading}
            className="form-input"
          />
          <small className="form-help">
            Enter the repository path in format: owner/repository
          </small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Adding...' : 'Add Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectForm;
