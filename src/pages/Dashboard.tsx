import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Folder, Clock, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { databaseService } from '@/services/database.service';
import { useProjectStore } from '@/stores/projectStore';
import type { Project } from '@/types';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createProject } = useProjectStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    try {
      const userProjects = await databaseService.projects.getByOwner(user.id);
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewProject = async () => {
    if (!user) return;

    try {
      const project = await createProject({
        name: 'Untitled Project',
        appType: 'web',
        ownerId: user.id,
        status: 'draft',
        isPublic: false,
        lastModifiedBy: user.id,
        screenCount: 0,
        componentCount: 0,
        collaboratorCount: 0,
        hasGeneratedFramework: false
      });
      
      navigate(`/project/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back, {user?.displayName || 'User'}
          </h1>
          <p className="text-neutral-600">
            Create and manage your visual app projects
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <Folder className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-neutral-900">{projects.length}</span>
            </div>
            <h3 className="text-sm font-medium text-neutral-600">Total Projects</h3>
          </div>
          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-secondary-600" />
              <span className="text-2xl font-bold text-neutral-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-neutral-600">Recent Edits</h3>
          </div>
          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-success" />
              <span className="text-2xl font-bold text-neutral-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-neutral-600">Collaborators</h3>
          </div>
          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-8 h-8 text-warning" />
              <span className="text-2xl font-bold text-neutral-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-neutral-600">AI Assists</h3>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">Your Projects</h2>
          <button
            onClick={createNewProject}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-neutral-600">Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="bg-white p-6 rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">
                    {project.screenCount} screens
                  </span>
                  <span className="text-neutral-500">
                    {new Date(project.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
            <Folder className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No projects yet
            </h3>
            <p className="text-neutral-600 mb-4">
              Create your first project to start building
            </p>
            <button
              onClick={createNewProject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};