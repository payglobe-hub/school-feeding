import React from 'react';
import {
  Users,
  FileText,
  Image,
  Calendar,
  TrendingUp,
  Eye,
  MessageSquare,
  DollarSign,
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  
  const stats = {
    totalChildren: 2150000,
    totalSchools: 18500,
    totalMeals: 456000000,
    totalPartners: 45,
    activePrograms: 16,
    monthlyViews: 125000,
    pendingContent: 12,
    totalDonations: 2500000
  };

  const recentActivity = [
    {
      id: 1,
      action: 'New article published',
      item: 'School Feeding Impact Report 2024',
      user: 'Admin',
      time: '2 hours ago',
      type: 'content'
    },
    {
      id: 2,
      action: 'Images uploaded',
      item: 'Community Outreach Photos',
      user: 'Editor',
      time: '4 hours ago',
      type: 'media'
    },
    {
      id: 3,
      action: 'Event created',
      item: 'Nutrition Education Workshop',
      user: 'Coordinator',
      time: '1 day ago',
      type: 'event'
    },
    {
      id: 4,
      action: 'Partner updated',
      item: 'World Food Programme Partnership',
      user: 'Admin',
      time: '2 days ago',
      type: 'partnership'
    }
  ];

  const statsCards = [
    {
      title: 'Children Served',
      value: stats.totalChildren.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12.5%'
    },
    {
      title: 'Active Schools',
      value: stats.totalSchools.toLocaleString(),
      icon: FileText,
      color: 'bg-green-500',
      change: '+5.2%'
    },
    {
      title: 'Meals Served',
      value: stats.totalMeals.toLocaleString(),
      icon: Activity,
      color: 'bg-yellow-500',
      change: '+18.7%'
    },
    {
      title: 'Monthly Views',
      value: stats.monthlyViews.toLocaleString(),
      icon: Eye,
      color: 'bg-purple-500',
      change: '+23.1%'
    }
  ];

  const quickActions = [
    {
      title: 'Add News Article',
      description: 'Publish new updates and announcements',
      icon: FileText,
      action: () => console.log('Add article')
    },
    {
      title: 'Upload Media',
      description: 'Add photos and videos to gallery',
      icon: Image,
      action: () => console.log('Upload media')
    },
    {
      title: 'Create Event',
      description: 'Schedule new program events',
      icon: Calendar,
      action: () => console.log('Create event')
    },
    {
      title: 'View Analytics',
      description: 'Check website performance metrics',
      icon: TrendingUp,
      action: () => console.log('View analytics')
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="gradient-primary rounded-3xl p-8 text-white shadow-large relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ghana-primary-900/20 to-transparent"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">Welcome back, {user?.name || 'Administrator'}!</h1>
            <p className="text-ghana-primary-100 text-lg font-medium mb-6">Here's what's happening with the Ghana School Feeding Programme today.</p>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-sm font-medium text-white">Active Program Status</p>
                <p className="text-2xl font-bold">Online</p>
              </div>
              <div className="bg-ghana-secondary-500/20 backdrop-blur-sm rounded-xl p-4 border border-ghana-secondary-400/30">
                <p className="text-sm font-medium text-white">Meals Served Today</p>
                <p className="text-2xl font-bold">2,450</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-6 ml-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 mb-2 overflow-hidden">
                <img 
                  src="/Logo.jpeg" 
                  alt="Ghana School Feeding Programme Logo" 
                  className="h-20 w-auto object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <span className="text-2xl font-bold text-white" style={{display: 'none'}}>GS</span>
              </div>
              <p className="text-xs text-ghana-primary-200 font-medium">GSFP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="stats-card group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ghana-neutral-500 uppercase tracking-wider mb-1">{stat.title}</p>
                  <p className="text-4xl font-bold text-ghana-neutral-900 mb-3 group-hover:scale-105 transition-transform duration-200">{stat.value}</p>
                  <div className="flex items-center space-x-2">
                    <span className="badge-success">+{stat.change} from last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-medium group-hover:shadow-large`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-ghana-primary-500 to-ghana-secondary-500 rounded-full"></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-ghana-neutral-900">Quick Actions</h3>
              <p className="text-sm text-ghana-neutral-500 mt-1">Common tasks and shortcuts</p>
            </div>
            <div className="w-12 h-12 bg-ghana-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-ghana-primary-600" />
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className="p-6 border-2 border-ghana-neutral-200 rounded-2xl hover:border-ghana-primary-300 hover:bg-ghana-primary-50 hover:shadow-medium transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-ghana-primary-500 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-200 shadow-soft">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-right opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-xs text-ghana-neutral-500">Click to</span>
                        <br />
                        <span className="text-xs font-medium text-ghana-primary-600">{action.title.split(' ')[0]}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-ghana-neutral-900 mb-2 text-xl">{action.title}</h4>
                    <p className="text-sm text-ghana-neutral-600 leading-relaxed">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-ghana-neutral-900">Recent Activity</h3>
              <p className="text-sm text-ghana-neutral-500 mt-1">Latest updates and changes</p>
            </div>
            <div className="w-12 h-12 bg-ghana-secondary-100 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-ghana-secondary-600" />
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-ghana-neutral-50 transition-colors duration-200 animate-slide-up border border-transparent hover:border-ghana-neutral-200" style={{animationDelay: `${index * 150}ms`}}>
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-ghana-primary-500 to-ghana-primary-600 rounded-2xl flex items-center justify-center shadow-soft">
                      <span className="text-lg font-bold text-white">
                        {activity.user.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <p className="text-sm text-ghana-neutral-900 leading-relaxed font-medium">
                        <span className="font-bold text-ghana-neutral-900">{activity.user}</span>{' '}
                        <span className="text-ghana-neutral-600">{activity.action}</span>{' '}
                        <span className="font-bold text-ghana-primary-600 hover:text-ghana-primary-700 cursor-pointer transition-colors duration-200">{activity.item}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`badge-${activity.type === 'content' ? 'primary' : activity.type === 'media' ? 'secondary' : 'info'}`}>{activity.type}</span>
                        <p className="text-xs text-ghana-neutral-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-ghana-neutral-200">
              <button className="w-full btn-secondary text-center py-3 font-semibold">
                View All Activity →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-ghana-neutral-900">Pending Tasks</h3>
            <p className="text-sm text-ghana-neutral-500 mt-1">Items requiring your attention</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center animate-pulse-slow">
            <MessageSquare className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-warning-50 border-2 border-warning-200 rounded-2xl hover:shadow-medium transition-all duration-200 group cursor-pointer">
              <div className="flex items-center space-x-4 flex-1">
                <div className="bg-warning-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                  <MessageSquare className="h-7 w-7 text-warning-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-ghana-neutral-900 mb-1">Review pending comments</p>
                  <p className="text-sm text-ghana-neutral-600">12 comments awaiting moderation</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="badge-warning">High Priority</span>
                    <span className="text-xs text-ghana-neutral-500">Due: Today</span>
                  </div>
                </div>
              </div>
              <button className="btn-warning px-6 py-2 font-semibold">Review</button>
            </div>
            <div className="flex items-center justify-between p-6 bg-ghana-primary-50 border-2 border-ghana-primary-200 rounded-2xl hover:shadow-medium transition-all duration-200 group cursor-pointer">
              <div className="flex items-center space-x-4 flex-1">
                <div className="bg-ghana-primary-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                  <FileText className="h-7 w-7 text-ghana-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-ghana-neutral-900 mb-1">Update program guidelines</p>
                  <p className="text-sm text-ghana-neutral-600">Annual review due in 2 weeks</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="badge-primary">Medium Priority</span>
                    <span className="text-xs text-ghana-neutral-500">Due: 2 weeks</span>
                  </div>
                </div>
              </div>
              <button className="btn-primary px-6 py-2 font-semibold">Update</button>
            </div>
            <div className="flex items-center justify-between p-6 bg-ghana-secondary-50 border-2 border-ghana-secondary-200 rounded-2xl hover:shadow-medium transition-all duration-200 group cursor-pointer">
              <div className="flex items-center space-x-4 flex-1">
                <div className="bg-ghana-secondary-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                  <DollarSign className="h-7 w-7 text-ghana-secondary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-ghana-neutral-900 mb-1">Donation reports</p>
                  <p className="text-sm text-ghana-neutral-600">Monthly summary ready for review</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="badge-success">Low Priority</span>
                    <span className="text-xs text-ghana-neutral-500">Due: This week</span>
                  </div>
                </div>
              </div>
              <button className="btn-success px-6 py-2 font-semibold">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
