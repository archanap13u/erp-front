import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    TrendingUp,
    Building2,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw
} from 'lucide-react';

interface AnalyticsData {
    summary: {
        totalOrganizations: number;
        activeOrganizations: number;
        totalEmployees: number;
        totalStudents: number;
        totalUsers: number;
        growth: {
            organizations: number;
            employees: number;
            students: number;
        };
    };
    charts: {
        organizationGrowth: Array<{ _id: string; count: number }>;
        employeeGrowth: Array<{ _id: string; count: number }>;
        studentGrowth: Array<{ _id: string; count: number }>;
        subscriptionStats: { [key: string]: number };
        userDistribution: {
            employees: number;
            students: number;
        };
    };
    topOrganizations: Array<{
        _id: string;
        name: string;
        organizationId: string;
        isActive: boolean;
        subscription: { plan: string };
        employeeCount: number;
        studentCount: number;
        totalUsers: number;
    }>;
}

export default function AnalyticsPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }
        fetchAnalytics();
    }, [navigate, timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/superadmin/analytics?days=${timeRange}`);
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const GrowthIndicator = ({ value }: { value: number }) => {
        const isPositive = value >= 0;
        return (
            <span className={`inline-flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {Math.abs(value)}%
            </span>
        );
    };

    const SimpleBarChart = ({ data, color }: { data: { [key: string]: number }; color: string }) => {
        const entries = Object.entries(data);
        const maxValue = Math.max(...entries.map(([_, v]) => v), 1);
        return (
            <div className="space-y-3">
                {entries.map(([label, value]) => (
                    <div key={label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{label}</span>
                            <span className="font-semibold text-gray-900">{value}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / maxValue) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const ActivityChart = ({ data, color }: { data: Array<{ _id: string; count: number }>; color: string }) => {
        if (data.length === 0) return <div className="flex items-center justify-center h-32 text-gray-400">No data for this period</div>;
        const maxValue = Math.max(...data.map(d => d.count), 1);
        const height = 100;
        return (
            <div className="relative h-32">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${data.length * 20} ${height}`}>
                    {[0, 25, 50, 75, 100].map(y => <line key={y} x1="0" y1={height - y} x2={data.length * 20} y2={height - y} stroke="#e5e7eb" strokeWidth="1" />)}
                    <polyline fill="none" stroke={color} strokeWidth="2" points={data.map((d, i) => `${i * 20 + 10},${height - (d.count / maxValue) * height}`).join(' ')} />
                    {data.map((d, i) => <circle key={i} cx={i * 20 + 10} cy={height - (d.count / maxValue) * height} r="3" fill={color} />)}
                </svg>
            </div>
        );
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;

    return (
        <div className="p-8 text-[#1d2129]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
                    <p className="text-gray-600">Platform-wide statistics and insights</p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last year</option>
                    </select>
                    <button onClick={fetchAnalytics} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <GrowthIndicator value={data?.summary.growth.organizations || 0} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{data?.summary.totalOrganizations || 0}</h3>
                    <p className="text-sm text-gray-600">Total Organizations</p>
                    <p className="text-xs text-gray-500 mt-1">{data?.summary.activeOrganizations || 0} active</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Organization Growth</h2>
                    {data && <ActivityChart data={data.charts.organizationGrowth} color="#6366f1" />}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Subscription Plans</h2>
                    {data && <SimpleBarChart data={data.charts.subscriptionStats} color="bg-gradient-to-r from-indigo-500 to-purple-500" />}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Top Organizations</h2>
                    <Link to="/superadmin/organizations" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Organization</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data?.topOrganizations.map((org, index) => (
                                <tr key={org._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">{index + 1}</div>
                                            <div>
                                                <Link to={`/superadmin/organizations/${org._id}`} className="font-semibold text-gray-900 hover:text-indigo-600">{org.name}</Link>
                                                <p className="text-xs text-gray-500">{org.organizationId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${org.subscription?.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' : org.subscription?.plan === 'premium' ? 'bg-blue-100 text-blue-700' : org.subscription?.plan === 'basic' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {org.subscription?.plan || 'free'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{org.isActive ? 'Active' : 'Inactive'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
