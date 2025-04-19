import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-3">
            <ShieldX className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        
        <p className="text-gray-600 mb-6">
          Sorry, you don't have permission to access this page. This resource requires higher privileges than your current role provides.
        </p>
        
        {user && (
          <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
            <p className="text-sm text-gray-600">
              <strong>Logged in as:</strong> {user.name}<br />
              <strong>Role:</strong> {user.role.replace('_', ' ')}
            </p>
          </div>
        )}
        
        <div className="flex flex-col space-y-3">
          <Link to="/dashboard">
            <Button 
              fullWidth 
              variant="primary"
              icon={<Home className="w-4 h-4" />}
            >
              Go to Dashboard
            </Button>
          </Link>
          
          <p className="text-sm text-gray-500">
            If you believe this is a mistake, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;