import { Router, Response } from 'express';
import { ProjectModel } from '../models/Project';
import { GitHubService } from '../services/githubService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validate, addProjectSchema, updateProjectSchema, projectIdSchema } from '../validation/schemas';

const router = Router();

/**
 * GET /api/projects
 * Get all projects for the authenticated user
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const projects = await ProjectModel.findByUserId(userId);

    res.json({
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      error: 'Failed to fetch projects'
    });
  }
});

/**
 * POST /api/projects
 * Add a new project by GitHub repository path
 */
router.post('/', authenticateToken, validate(addProjectSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { repositoryPath } = req.body;

    // Parse repository path
    const { owner, repo } = GitHubService.parseRepositoryPath(repositoryPath);

    // Check if project already exists for this user
    const existingProject = await ProjectModel.existsForUser(owner, repo, userId);
    if (existingProject) {
      return res.status(409).json({
        error: 'Project already exists in your list'
      });
    }

    // Fetch repository data from GitHub API
    const githubRepo = await GitHubService.getRepository(owner, repo);
    if (!githubRepo) {
      return res.status(404).json({
        error: 'Repository not found on GitHub'
      });
    }

    // Convert GitHub data to our project format
    const projectData = GitHubService.convertToProjectData(githubRepo);

    // Create project in database
    const project = await ProjectModel.create({
      user_id: userId,
      ...projectData
    });

    res.status(201).json({
      message: 'Project added successfully',
      project
    });
  } catch (error) {
    console.error('Add project error:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('Invalid repository path')) {
        return res.status(400).json({
          error: error.message
        });
      }
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          error: error.message
        });
      }
    }

    res.status(500).json({
      error: 'Failed to add project'
    });
  }
});

/**
 * GET /api/projects/:id
 * Get a specific project by ID
 */
router.get('/:id', authenticateToken, validate(projectIdSchema, 'params'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const projectId = parseInt(req.params.id);

    const project = await ProjectModel.findByIdAndUserId(projectId, userId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      error: 'Failed to fetch project'
    });
  }
});

/**
 * PUT /api/projects/:id
 * Update project data (refresh from GitHub)
 */
router.put('/:id', authenticateToken, validate(projectIdSchema, 'params'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const projectId = parseInt(req.params.id);

    // Get existing project
    const existingProject = await ProjectModel.findByIdAndUserId(projectId, userId);
    if (!existingProject) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    // Fetch fresh data from GitHub API
    const githubRepo = await GitHubService.getRepository(existingProject.owner, existingProject.name);
    if (!githubRepo) {
      return res.status(404).json({
        error: 'Repository not found on GitHub'
      });
    }

    // Convert GitHub data to our project format
    const projectData = GitHubService.convertToProjectData(githubRepo);

    // Update project in database
    const updatedProject = await ProjectModel.update(projectId, userId, {
      stars: projectData.stars,
      forks: projectData.forks,
      open_issues: projectData.open_issues
    });

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: error.message
        });
      }
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          error: error.message
        });
      }
    }

    res.status(500).json({
      error: 'Failed to update project'
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', authenticateToken, validate(projectIdSchema, 'params'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const projectId = parseInt(req.params.id);

    const deleted = await ProjectModel.delete(projectId, userId);
    if (!deleted) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      error: 'Failed to delete project'
    });
  }
});

export default router;
