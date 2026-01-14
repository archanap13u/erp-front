import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Building2,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    Key,
    Copy
} from 'lucide-react';

interface Organization {
    _id: string;
    name: string;
    organizationId: string;
    domain?: string;
    username: string;
    password: string;
    isActive: boolean;
    createdAt: string;
    adminId?: {
        employeeName: string;
        email: string;
    };
    subscription?: {
        plan: string;
        maxUsers?: number;
    };
    stats?: {
        totalUsers: number;
        employeeCount: number;
        studentCount: number;
    };
}

export default function OrganizationsPage() {
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }
        fetchOrganizations();
    }, [navigate, statusFilter]);

    const fetchOrganizations = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            const response = await fetch(`/api/superadmin/organizations?${params}`);
            const data = await response.json();
            if (data.success) setOrganizations(data.data);
        } catch (error) {
            console.error('Error fetching organizations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            const response = await fetch(`/api/superadmin/organizations/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                alert(data.message);
                fetchOrganizations();
            } else alert(data.error);
        } catch (error) {
            console.error('Error deleting organization:', error);
            alert('Failed to delete organization');
        }
    };

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copied to clipboard!`);
    };

    const filteredOrganizations = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.organizationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;

    return (
        <div className="p-8 text-[#1d2129]">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Organizations</h1>
                        <p className="text-gray-600">Manage all organizations in your platform</p>
                    </div>
                    <Link to="/superadmin/organizations/new" className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition">
                        <Plus className="w-5 h-5" />
                        <span>Create Organization</span>
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search organizations..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border border-gray-300 rounded-lg outline-none">
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredOrganizations.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Organization</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Credentials</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Seats</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredOrganizations.map((org) => (
                                    <tr key={org._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{org.name}</div>
                                            <div className="text-sm text-gray-500">{org.organizationId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500">U: {org.username}</div>
                                            <div className="text-xs text-gray-500">P: {visiblePasswords.has(org._id) ? org.password : '••••••••'}
                                                <button onClick={() => togglePasswordVisibility(org._id)} className="ml-1 text-gray-400 hover:text-indigo-600">
                                                    {visiblePasswords.has(org._id) ? <EyeOff size={12} /> : <Eye size={12} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${org.subscription?.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {org.subscription?.plan || 'free'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{org.stats?.totalUsers || 0} / {org.subscription?.maxUsers || 10}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {org.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                                {org.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link to={`/superadmin/organizations/${org._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={16} /></Link>
                                                <Link to={`/superadmin/organizations/${org._id}/edit`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit size={16} /></Link>
                                                <button onClick={() => handleDelete(org._id, org.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations found</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
