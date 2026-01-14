import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    Edit,
    Trash2,
    Users,
    Calendar,
    Globe,
    Shield,
    CheckCircle,
    XCircle,
    Crown,
    Key,
    Eye,
    EyeOff,
    Copy,
    CreditCard
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
        _id: string;
        employeeName: string;
        email: string;
        designation: string;
    };
    createdBy?: {
        fullName: string;
        email: string;
    };
    subscription: {
        plan: string;
        status?: string;
        activeLicense?: {
            name: string;
            type: string;
        };
        startDate: string;
        expiryDate?: string;
        maxUsers?: number;
    };
    stats?: {
        totalUsers: number;
        employeeCount: number;
        studentCount: number;
    };
}

export default function OrganizationDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }
        if (id) fetchOrganization();
    }, [navigate, id]);

    const fetchOrganization = async () => {
        try {
            const response = await fetch(`/api/superadmin/organizations/${id}`);
            const data = await response.json();
            if (data.success) setOrganization(data.data);
            else {
                alert('Organization not found');
                navigate('/superadmin/organizations');
            }
        } catch (error) {
            console.error('Error fetching organization:', error);
            alert('Failed to load organization');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!organization) return;
        if (!confirm(`Are you sure you want to delete "${organization.name}"?`)) return;
        try {
            const response = await fetch(`/api/superadmin/organizations/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                alert(data.message);
                navigate('/superadmin/organizations');
            } else alert(data.error);
        } catch (error) {
            console.error('Error deleting organization:', error);
            alert('Failed to delete organization');
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copied to clipboard!`);
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;
    if (!organization) return <div className="p-8"><p>Organization not found</p></div>;

    return (
        <div className="p-8 text-[#1d2129]">
            <div className="mb-8">
                <Link to="/superadmin/organizations" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Organizations
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                            <p className="text-gray-600">{organization.organizationId}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link to={`/superadmin/organizations/${id}/edit`} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                            <Edit size={16} />
                            <span>Edit</span>
                        </Link>
                        <button onClick={handleDelete} className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                            <Trash2 size={16} />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Key className="w-5 h-5 mr-2 text-indigo-600" />
                            Login Credentials
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Username</p>
                                    <code className="text-lg font-mono font-semibold text-gray-900">{organization.username || '—'}</code>
                                </div>
                                <button onClick={() => copyToClipboard(organization.username, 'Username')} className="p-2 text-gray-400 hover:text-indigo-600"><Copy size={20} /></button>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Password</p>
                                        <code className="text-lg font-mono font-semibold text-gray-900">{showPassword ? organization.password : '••••••••••••'}</code>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => setShowPassword(!showPassword)} className="p-2 text-gray-400 hover:text-indigo-600">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                                        <button onClick={() => copyToClipboard(organization.password, 'Password')} className="p-2 text-gray-400 hover:text-indigo-600"><Copy size={20} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                            License
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Status</p>
                                <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${organization.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {organization.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">User Limit</p>
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold">{organization.stats?.totalUsers || 0} / {organization.subscription?.maxUsers || 0}</span>
                                    <span className="text-xs text-gray-500">users used</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
