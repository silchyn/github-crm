import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProjectList from './projects/ProjectList';

/**
 * Dashboard component for authenticated users
 */
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>GitHub CRM</h1>
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <ProjectList />
      </main>
    </div>
  );
};

export default Dashboard;
