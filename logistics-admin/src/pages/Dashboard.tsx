import React, { useState, useEffect } from 'react';
import { Package, Users, Clock, AlertTriangle, Map } from 'lucide-react';
import { orderService, riderService } from '../services/api';
import Layout from '../components/layout/Layout';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [riderStats, setRiderStats] = useState<any>(null);
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [activeRiders, setActiveRiders] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch order statistics
        const orderStatsData = await orderService.getOrderStats();
        setOrderStats(orderStatsData);
        
        // Fetch rider statistics if user is not a rider
        if (user?.role !== 'rider') {
          const riderStatsData = await riderService.getRiderStats();
          setRiderStats(riderStatsData);
        }
        
        // Fetch active deliveries
        const ordersResponse = await orderService.getOrders({
          status: ['pending', 'assigned', 'picked_up', 'in_transit'].join(','),
          limit: 10
        });
        setActiveDeliveries(ordersResponse.orders || []);
        
        // Fetch exceptions
        const exceptionsResponse = await orderService.getOrders({
          status: 'exception',
          limit: 10
        });
        setExceptions(exceptionsResponse.orders || []);
        
        // Fetch active riders if user is not a rider
        if (user?.role !== 'rider') {
          const activeRidersResponse = await riderService.getRiders({
            status: 'active',
            limit: 10
          });
          setActiveRiders(activeRidersResponse.riders || []);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // Mock data for development
  const mockOrderStats = {
    activeOrders: 32,
    onTimeRate: 92,
    exceptionOrders: 7
  };
  
  const mockRiderStats = {
    activeRiders: 18
  };

  // Return loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Use actual data or fall back to mock data for development
  const stats = {
    activeOrders: orderStats?.activeOrders || mockOrderStats.activeOrders,
    onTimeRate: orderStats?.onTimeRate || mockOrderStats.onTimeRate,
    exceptionOrders: orderStats?.exceptionOrders || mockOrderStats.exceptionOrders,
    activeRiders: riderStats?.activeRiders || mockRiderStats.activeRiders
  };

  return (
    <Layout>
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={<Package />}
          change={{ value: '5 from yesterday', positive: true }}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        
        {user?.role !== 'rider' && (
          <StatCard
            title="Active Riders"
            value={stats.activeRiders}
            icon={<Users />}
            change={{ value: '2 from yesterday', positive: true }}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
        )}
        
        <StatCard
          title="On-Time Delivery Rate"
          value={`${stats.onTimeRate}%`}
          icon={<Clock />}
          change={{ value: '3% from yesterday', positive: true }}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        
        <StatCard
          title="Exceptions"
          value={stats.exceptionOrders}
          icon={<AlertTriangle />}
          change={{ value: '2 from yesterday', positive: false }}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>
      
      {/* Map and Active Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card title="Live Delivery Map" icon={<Map className="w-5 h-5 text-gray-600" />}>
            <div className="h-96 bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-500">Interactive Map View</span>
              </div>
              
              {/* Map Controls */}
              <div className="absolute top-3 right-3 bg-white rounded-md shadow">
                <div className="p-2 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs">Active Riders ({stats.activeRiders})</span>
                  </div>
                </div>
                <div className="p-2 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs">En Route (12)</span>
                  </div>
                </div>
                <div className="p-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs">Exceptions ({stats.exceptionOrders})</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card 
            title="Active Deliveries" 
            footer={
              <a href="/orders" className="text-blue-600 text-sm font-medium hover:text-blue-800">
                View All
              </a>
            }
          >
            <div className="overflow-y-auto" style={{ maxHeight: '384px' }}>
              {activeDeliveries.length > 0 ? (
                activeDeliveries.map((order: any) => (
                  <div key={order._id} className="p-3 border-b border-gray-100 hover:bg-blue-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">#{order.orderNumber}</span>
                      <span className={`${
                        order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'picked_up' ? 'bg-green-100 text-green-800' :
                        order.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      } text-xs px-2 py-1 rounded`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {order.customer.name} • {order.customer.address}
                    </div>
                    <div className="text-xs text-gray-500">
                      ETA: {new Date(order.delivery.estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {order.rider && ' • Rider: ' + (order.rider.user ? order.rider.user.name : 'Assigned')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No active deliveries at the moment
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Rider Status and Exception Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rider Status - Only show for admin/managers */}
        {user?.role !== 'rider' && (
          <Card title="Rider Status" 
            footer={
              <a href="/riders" className="text-blue-600 text-sm font-medium hover:text-blue-800">
                View All
              </a>
            }
          >
            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
              {activeRiders.length > 0 ? (
                activeRiders.map((rider: any) => (
                  <div key={rider._id} className="p-3 border-b border-gray-100 hover:bg-blue-50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{rider.user?.name || 'Unnamed Rider'}</div>
                          <div className="text-xs text-gray-500">{rider.deliveriesCompleted} deliveries completed today</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`
                          ${rider.status === 'active' ? 'bg-green-100 text-green-800' : 
                            rider.status === 'on_break' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'} 
                          text-xs px-2 py-1 rounded mr-2
                        `}>
                          {rider.status.charAt(0).toUpperCase() + rider.status.slice(1).replace('_', ' ')}
                        </span>
                        <a href={`/tracking?rider=${rider._id}`} className="text-blue-600 cursor-pointer">
                          <Map className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No active riders at the moment
                </div>
              )}
            </div>
          </Card>
        )}
        
        {/* Exception Management */}
        <Card 
          title="Exceptions" 
          footer={
            <a href="/orders?status=exception" className="text-blue-600 text-sm font-medium hover:text-blue-800">
              View All
            </a>
          }
        >
          <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
            {exceptions.length > 0 ? (
              exceptions.map((order: any) => (
                <div key={order._id} className="p-3 border-b border-gray-100 hover:bg-blue-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">#{order.orderNumber}</span>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      {order.exception?.type ? order.exception.type.replace('_', ' ') : 'Exception'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    {order.customer.name} • {order.customer.address}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {order.rider ? `Rider: ${order.rider.user?.name || 'Assigned'}` : 'No rider assigned'} • 
                    Reported: {order.exception?.reportedAt ? new Date(order.exception.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.location.href = `/orders/${order._id}`}
                    >
                      Resolve
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                    >
                      Contact Customer
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No exceptions at the moment
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;