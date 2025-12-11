import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock project data - replace with actual API call
      const mockProjects = [
        {
          id: '1',
          name: 'Sunset Valley Development',
          type: 'Residential',
          status: 'Active',
          value: 2500000,
          completion: 65,
          startDate: '2024-01-15',
          location: 'Austin, TX'
        },
        {
          id: '2',
          name: 'Downtown Office Complex',
          type: 'Commercial',
          status: 'Planning',
          value: 5200000,
          completion: 15,
          startDate: '2024-03-01',
          location: 'Dallas, TX'
        },
        {
          id: '3',
          name: 'Lakeside Condominiums',
          type: 'Residential',
          status: 'Completed',
          value: 3800000,
          completion: 100,
          startDate: '2023-08-20',
          location: 'Houston, TX'
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProjects(mockProjects);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Planning': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadProjects} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your real estate development projects</p>
        </div>
        <Button className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Empty 
          title="No projects found"
          description="Get started by creating your first project"
          actionLabel="Create Project"
          onAction={() => {}}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {project.location}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type</span>
                      <p className="font-medium text-gray-900">{project.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Value</span>
                      <p className="font-medium text-gray-900">{formatCurrency(project.value)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-gray-900">{project.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.completion}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Started {new Date(project.startDate).toLocaleDateString()}
                    </span>
                    <div className="flex items-center text-primary text-sm font-medium">
                      View Details
                      <ApperIcon name="ChevronRight" size={14} className="ml-1" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;