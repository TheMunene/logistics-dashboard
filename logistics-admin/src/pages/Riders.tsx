import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Users, Filter, Search, Plus, MapPin, PhoneCall } from 'lucide-react';
import { riderService } from '../services/api';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const Riders: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Parse query params
  const queryParams = new URLSearchParams(location.search);
  const statusParam = queryParams.get('status');

  useEffect(() => {
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [statusParam]);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        setLoading(true);
        
        const params: any = { page, limit: 10 };
        if (statusFilter) params.status = statusFilter;
        
        const response = await riderService.getRiders(params);
        setRiders(response.riders || []);
        setTotalPages(response.totalPages || 1);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching riders:', error);
        setLoading(false);
      }
    };
    
    fetchRiders();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchTerm);
    // This would ideally search the backend
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'on_break':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Riders</h1>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search riders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          
          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_break">On Break</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          
          {/* Create Rider Button - Only visible to admin and logistics manager */}
          {user && ['admin', 'logistics_manager'].includes(user.role) && (
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => window.location.href = '/riders/new'}
            >
              Add Rider
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : riders.length > 0 ? (
          riders.map((rider) => (
            <Card key={rider._id} className="flex flex-col h-full">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {rider.user?.name || 'Unnamed Rider'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <PhoneCall className="w-4 h-4 mr-1" />
                      {rider.phone}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(rider.status)}`}>
                  {formatStatus(rider.status)}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">Deliveries</div>
                  <div className="text-lg font-semibold">{rider.deliveriesCompleted || 0}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">Rating</div>
                  <div className="text-lg font-semibold">
                    {rider.ratings?.average ? `${rider.ratings.average.toFixed(1)}/5.0` : 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>
                  {rider.location?.coordinates ? 
                    `${rider.location.coordinates[1].toFixed(6)}, ${rider.location.coordinates[0].toFixed(6)}` : 
                    'Location not available'}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                <Link to={`/riders/${rider._id}`} className="text-blue-600 text-sm hover:text-blue-800">
                  View Details
                </Link>
                <Link to={`/tracking?rider=${rider._id}`} className="text-blue-600 text-sm hover:text-blue-800">
                  Track
                </Link>
                {user && ['admin', 'logistics_manager'].includes(user.role) && (
                  <Link to={`/riders/${rider._id}/edit`} className="text-blue-600 text-sm hover:text-blue-800">
                    Edit
                  </Link>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No riders found
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Previous</span>
              &lsaquo;
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - page) < 3 || p === 1 || p === totalPages)
              .map((p, i, arr) => {
                // Add ellipsis
                if (i > 0 && arr[i - 1] !== p - 1) {
                  return (
                    <span
                      key={`ellipsis-${p}`}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      p === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {p}
                  </button>
                );
              })}
            
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Next</span>
              &rsaquo;
            </button>
          </nav>
        </div>
      )}
    </Layout>
  );
};

export default Riders;