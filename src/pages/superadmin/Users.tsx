import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users,
    Search,
    Filter,
    Briefcase,
    GraduationCap,
    Building2,
    CheckCircle,
    XCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    username?: string;
    role: string;
    designation?: string;
    type: 'employee' | 'student';
    isActive: boolean;
    createdAt: string;
    organization?: {
        _id: string;
        name: string;
        organizationId: string;
    };
}

interface Organization {
    _id: string;
    name: string;
    organizationId: string;
}

export default function UsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'employee' | 'student'>('all');
    const [orgFilter, setOrgFilter] = useState('');
    const [pagination, setPagination] = useState({
        page: 1, limit: 20, total: 0, totalPages: 0, totalEmployees: 0, totalStudents: 0
    });

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }
        fetchUsers();
    }, [navigate, userTypeFilter, orgFilter, pagination.page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('type', userTypeFilter);
            params.append('page', pagination.page.toString());
            params.append('limit', pagination.limit.toString());
            if (searchTerm) params.append('search', searchTerm);
            if (orgFilter) params.append('organizationId', orgFilter);

            const response = await fetch(`/api/superadmin/users?${params}`);
            const result = await response.json();
            if (result.success) {
                setUsers(result.data.users);
                setPagination(prev => ({ ...prev, ...result.data.pagination }));
                setOrganizations(result.data.organizations);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchUsers();
    };

    return (
        <div className="p-8 text-[#1d2129]">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
                <p className="text-gray-600">Manage users across organizations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border p-6 flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600"><Users size={24} /></div>
                    <div><p className="text-2xl font-bold">{pagination.total}</p><p className="text-sm text-gray-500">Total Users</p></div>
                </div>
                <div className="bg-white rounded-xl border p-6 flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600"><Briefcase size={24} /></div>
                    <div><p className="text-2xl font-bold">{pagination.totalEmployees}</p><p className="text-sm text-gray-500">Employees</p></div>
                </div>
                <div className="bg-white rounded-xl border p-6 flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-purple-100 text-purple-600"><GraduationCap size={24} /></div>
                    <div><p className="text-2xl font-bold">{pagination.totalStudents}</p><p className="text-sm text-gray-500">Students</p></div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none" />
                    </div>
                    <select value={userTypeFilter} onChange={(e) => setUserTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg"><option value="all">All Types</option><option value="employee">Employees</option><option value="student">Students</option></select>
                    <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="">All Orgs</option>{organizations.map(org => <option key={org._id} value={org._id}>{org.name}</option>)}</select>
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">Search</button>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-left text-xs font-semibold text-gray-600 uppercase">
                            <th className="px-6 py-4 whitespace-nowrap">User</th>
                            <th className="px-6 py-4 whitespace-nowrap">Type</th>
                            <th className="px-6 py-4 whitespace-nowrap">Organization</th>
                            <th className="px-6 py-4 whitespace-nowrap">Status</th>
                            <th className="px-6 py-4 whitespace-nowrap">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map(user => (
                            <tr key={`${user.type}-${user._id}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 capitalize text-sm">{user.type}</td>
                                <td className="px-6 py-4">
                                    {user.organization ? <Link to={`/superadmin/organizations/${user.organization._id}`} className="text-indigo-600 hover:underline">{user.organization.name}</Link> : '—'}
                                </td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t flex justify-between items-center text-sm">
                    <p>Showing {users.length} of {pagination.total} users</p>
                    <div className="flex space-x-2">
                        <button disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} className="p-1 border rounded disabled:opacity-50"><ChevronLeft size={18} /></button>
                        <span className="py-1">Page {pagination.page} of {pagination.totalPages}</span>
                        <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} className="p-1 border rounded disabled:opacity-50"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
