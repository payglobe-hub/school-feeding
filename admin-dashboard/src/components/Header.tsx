import React, { useState } from 'react';
import { Bell, Search, Menu, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'New Content Published',
      message: 'Article "School Feeding Program Updates" has been published',
      type: 'success',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      title: 'System Update',
      message: 'Database backup completed successfully',
      type: 'info',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'Content Review Required',
      message: 'Event "Regional Meeting" needs your review',
      type: 'warning',
      time: '3 hours ago',
      read: true
    }
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id: number) => {
    // In a real app, this would update the notification in the database
    console.log('Mark notification as read:', id);
  };

  return (
    <header className="bg-white shadow-soft border-b border-ghana-neutral-200 px-6 py-4 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Page title */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img 
              src="/Logo.jpeg" 
              alt="Ghana School Feeding Programme Logo" 
              className="h-24 w-auto object-contain border-2 border-blue-500 rounded-lg"
              style={{
                filter: 'none',
                opacity: 1,
                display: 'block',
                backgroundColor: 'white',
                padding: '4px'
              }}
              onError={(e) => {
                e.currentTarget.src = '/api/placeholder/96/96';
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ghana-neutral-900">Admin Dashboard</h1>
            <p className="text-sm text-ghana-neutral-600 flex items-center mt-1">
              Welcome back, <span className="font-semibold text-ghana-neutral-900 ml-1">{user?.name || 'Administrator'}</span>
              <span className="ml-2 badge-success">Active Session</span>
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-6">
          <>
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-ghana-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="input-field pl-10 pr-4 py-2.5 w-80"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={handleNotificationClick}
              className={`relative p-2 text-ghana-neutral-400 hover:text-ghana-neutral-600 hover:bg-ghana-neutral-100 focus:outline-none focus:ring-2 focus:ring-ghana-primary-500 focus:ring-offset-2 rounded-lg transition-all duration-200 group ${
                showNotifications ? 'bg-ghana-neutral-100 text-ghana-neutral-700' : ''
              }`}
            >
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
              <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-bounce">3</div>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-ghana-neutral-200 z-50">
                <div className="p-4 border-b border-ghana-neutral-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-ghana-neutral-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-ghana-neutral-400 hover:text-ghana-neutral-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-ghana-neutral-100 last:border-b-0 hover:bg-ghana-neutral-50 cursor-pointer transition-colors ${
                            notification.read ? 'opacity-60' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 p-1 rounded-full ${
                              notification.type === 'success' ? 'bg-green-100 text-green-600' :
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                              notification.type === 'error' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                               notification.type === 'warning' ? <AlertCircle className="h-4 w-4" /> :
                               notification.type === 'error' ? <AlertCircle className="h-4 w-4" /> :
                               <CheckCircle className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-ghana-neutral-900">{notification.title}</p>
                              <p className="text-xs text-ghana-neutral-500 mt-1">{notification.message}</p>
                              <p className="text-xs text-ghana-neutral-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-ghana-neutral-500">
                        <Bell className="h-12 w-12 mx-auto mb-3 text-ghana-neutral-300" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-ghana-neutral-200">
                    <button className="w-full text-center text-sm text-ghana-primary-600 hover:text-ghana-primary-700 font-medium">
                      Mark all as read
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-ghana-neutral-100 transition-colors duration-200 cursor-pointer group">
            <div className="relative">
              <img
                className="w-10 h-10 rounded-xl border-2 border-ghana-neutral-200 shadow-soft group-hover:shadow-medium transition-shadow duration-200"
                src={user?.avatar || '/api/placeholder/40/40'}
                alt={user?.name}
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-ghana-secondary-500 rounded-full border-2 border-white animate-pulse-slow"></div>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-ghana-neutral-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-ghana-neutral-500">{user?.email || 'admin@gsfp.gov.gh'}</p>
            </div>
          </div>

          {/* Mobile menu button */}
          <button className="lg:hidden p-2 text-ghana-neutral-400 hover:text-ghana-neutral-600 hover:bg-ghana-neutral-100 focus:outline-none focus:ring-2 focus:ring-ghana-primary-500 focus:ring-offset-2 rounded-lg transition-all duration-200">
            <Menu className="h-6 w-6" />
          </button>
          </>
        </div>
      </div>
    </header>
  );
};

export default Header;
