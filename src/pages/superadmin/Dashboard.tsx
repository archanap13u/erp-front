import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Building2,
    Users,
    TrendingUp,
    Activity,
    Plus,
    ArrowRight
} from 'lucide-react';

interface DashboardStats {
    organizations: {
        total: number;
        active: number;
        inactive: number;
    };
    users: {
        totalEmployees: number;
        totalStudents: number;
        total: number;
    };
    subscriptions: {
        [key: string]: number;
    };
    recentOrganizations: Array<{
        _id: string;
        name: string;
        organizationId: string;
        createdAt: string;
        isActive: boolean;
    }>;
}

export default function SuperAdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        const name = localStorage.getItem('user_name');

        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }

        setUserName(name || 'Super Admin');
        fetchStats();
    }, [navigate]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/superadmin/stats');
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Organizations',
            value: stats?.organizations.total || 0,
            subtitle: `${stats?.organizations.active || 0} active`,
            icon: Building2,
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Active Subscriptions',
            value: Object.values(stats?.subscriptions || {}).reduce((a, b) => a + b, 0),
            subtitle: 'Across all plans',
            icon: TrendingUp,
            color: 'from-green-500 to-green-600',
        },
        {
            title: 'System Status',
            value: 'Healthy',
            subtitle: 'All systems operational',
            icon: Activity,
            color: 'from-orange-500 to-orange-600',
        }
    ];

    return (
        <div className="p-8 text-[#1d2129]">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {userName}!
                </h1>
                <p className="text-gray-600">
                    Here's what's happening with your platform today.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}>
                                <card.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {card.value}
                        </h3>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                            {card.title}
                        </p>
                        <p className="text-xs text-gray-500">
                            {card.subtitle}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/superadmin/organizations/new"
                        className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                        <div className="flex items-center space-x-3">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                            <span className="font-medium text-gray-700 group-hover:text-indigo-600">
                                Create Organization
                            </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                    </Link>

                    <Link
                        to="/superadmin/organizations"
                        className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
                    >
                        <div className="flex items-center space-x-3">
                            <Building2 className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                            <span className="font-medium text-gray-700 group-hover:text-purple-600">
                                Manage Organizations
                            </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                    </Link>

                    <Link
                        to="/superadmin/analytics"
                        className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                        <div className="flex items-center space-x-3">
                            <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                            <span className="font-medium text-gray-700 group-hover:text-green-600">
                                View Analytics
                            </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Recent Organizations</h2>
                    <Link
                        to="/superadmin/organizations"
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        View All →
                    </Link>
                </div>

                {stats?.recentOrganizations && stats.recentOrganizations.length > 0 ? (
                    <div className="space-y-3">
                        {stats.recentOrganizations.map((org) => (
                            <Link
                                key={org._id}
                                to={`/superadmin/organizations/${org._id}`}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{org.name}</h3>
                                        <p className="text-sm text-gray-500">{org.organizationId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${org.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {org.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No organizations yet. Create your first one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
