import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Trash2,
    Clock
} from 'lucide-react';

interface License {
    _id: string;
    name: string;
    type: string;
    duration: number;
    price: number | string;
    status: 'available' | 'assigned' | 'expired' | 'revoked';
    assignedTo?: {
        _id: string;
        name: string;
        organizationId: string;
    };
    assignedDate?: string;
    createdAt: string;
}

interface Organization {
    _id: string;
    name: string;
    organizationId: string;
}

export default function LicensesPage() {
    const navigate = useNavigate();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
    const [createForm, setCreateForm] = useState({ name: '', type: 'basic', duration: 365, price: '0' });
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [assignLoading, setAssignLoading] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }
        fetchLicenses();
    }, [navigate]);

    const fetchLicenses = async () => {
        try {
            const response = await fetch('/api/superadmin/licenses');
            const data = await response.json();
            if (data.success) setLicenses(data.data);
        } catch (error) {
            console.error('Error fetching licenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrganizations = async () => {
        try {
            const response = await fetch('/api/superadmin/organizations?status=active');
            const data = await response.json();
            if (data.success) setOrganizations(data.data);
        } catch (error) {
            console.error('Error fetching organizations:', error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const createdBy = localStorage.getItem('user_id');
            const response = await fetch('/api/superadmin/licenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...createForm, price: parseFloat(createForm.price) || 0, createdBy })
            });
            const data = await response.json();
            if (data.success) {
                alert('License created successfully');
                setIsCreateModalOpen(false);
                fetchLicenses();
                setCreateForm({ name: '', type: 'basic', duration: 365, price: '0' });
            } else alert(data.error);
        } catch (error) {
            alert('Failed to create license');
        }
    };

    const openAssignModal = (license: License) => {
        setSelectedLicense(license);
        setSelectedOrgId('');
        setIsAssignModalOpen(true);
        if (organizations.length === 0) fetchOrganizations();
    };

    const handleAssign = async () => {
        if (!selectedLicense || !selectedOrgId) return;
        setAssignLoading(true);
        try {
            const response = await fetch(`/api/superadmin/licenses/${selectedLicense._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedTo: selectedOrgId })
            });
            const data = await response.json();
            if (data.success) {
                alert('License assigned successfully');
                setIsAssignModalOpen(false);
                fetchLicenses();
            } else alert(data.error);
        } catch (error) {
            alert('Failed to assign license');
        } finally {
            setAssignLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this license?')) return;
        try {
            const response = await fetch(`/api/superadmin/licenses/${id}`, { method: 'DELETE' });
            if (response.ok) fetchLicenses();
            else alert('Failed to delete license');
        } catch (error) {
            console.error('Error deleting license:', error);
        }
    };

    const filteredLicenses = licenses.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.assignedTo?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;

    return (
        <div className="p-8 text-[#1d2129]">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Licenses</h1>
                    <p className="text-gray-600">Manage and assign subscription licenses</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                    <Plus className="w-5 h-5" />
                    <span>Create License</span>
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search licenses..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">License Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Assigned To</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredLicenses.map((license) => (
                            <tr key={license._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{license.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${license.type === 'enterprise' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{license.type}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap"><Clock className="w-4 h-4 inline mr-1" />{license.duration} days</td>
                                <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${license.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{license.status}</span></td>
                                <td className="px-6 py-4">{license.assignedTo ? <div><div className="text-sm font-medium text-gray-900">{license.assignedTo.name}</div><div className="text-xs text-gray-500">{license.assignedTo.organizationId}</div></div> : <span className="text-gray-400 text-sm italic">Unassigned</span>}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {license.status === 'available' && <button onClick={() => openAssignModal(license)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Assign</button>}
                                    <button onClick={() => handleDelete(license._id)} className="text-red-600 hover:text-red-900 p-1"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-6">Create New License</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div><label className="block text-sm font-semibold mb-1">License Name</label><input type="text" required value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
                            <div><label className="block text-sm font-semibold mb-1">Plan Type</label><select value={createForm.type} onChange={e => setCreateForm({ ...createForm, type: e.target.value })} className="w-full px-4 py-2 border rounded-lg"><option value="free">Free</option><option value="basic">Basic</option><option value="premium">Premium</option><option value="enterprise">Enterprise</option></select></div>
                            <div><label className="block text-sm font-semibold mb-1">Duration (Days)</label><input type="number" required min="1" value={createForm.duration} onChange={e => setCreateForm({ ...createForm, duration: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-lg" /></div>
                            <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button><button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Create License</button></div>
                        </form>
                    </div>
                </div>
            )}

            {isAssignModalOpen && selectedLicense && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-2">Assign License</h2>
                        <p className="text-gray-600 mb-6">Assign <b>{selectedLicense.name}</b> to an organization</p>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-semibold mb-1">Select Organization</label><select value={selectedOrgId} onChange={e => setSelectedOrgId(e.target.value)} className="w-full px-4 py-2 border rounded-lg"><option value="">-- Select Organization --</option>{organizations.map(org => (<option key={org._id} value={org._id}>{org.name} ({org.organizationId})</option>))}</select></div>
                            <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button><button onClick={handleAssign} disabled={!selectedOrgId || assignLoading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">{assignLoading ? 'Assigning...' : 'Assign License'}</button></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
