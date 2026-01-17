
import React, { useEffect, useState } from 'react';
import Workspace from '../components/Workspace';
import {
    Building2,
    Plus,
    Trash2,
    Pen,
    User,
    Lock,
    Shield,
    ArrowRight,
    Search,
    Filter,
    LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DepartmentModal from '../components/DepartmentModal';

export default function Departments() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeptForm, setShowDeptForm] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', code: '', username: '', password: '', panelType: 'Generic', features: [] as string[] });
    const [editingDept, setEditingDept] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [updatingCreds, setUpdatingCreds] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [rowInputs, setRowInputs] = useState<Record<string, { username?: string, password?: string, panelType?: string, show?: boolean }>>({});
    const [customizingDept, setCustomizingDept] = useState<any | null>(null);
    const [modalError, setModalError] = useState('');

    const orgId = localStorage.getItem('organization_id');

    useEffect(() => {
        if (!orgId) return;
        fetchData();
    }, [orgId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/resource/department?organizationId=${orgId}`);
            const json = await res.json();
            setDepartments(json.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDept = async (deptId: string) => {
        if (!confirm('Are you sure? This will delete the department and its credentials.')) return;
        try {
            const res = await fetch(`/api/resource/department/${deptId}?organizationId=${orgId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setDepartments(departments.filter(d => d._id !== deptId));
            }
        } catch (e) {
            console.error(e);
        }
    };


    const handleUpdateCreds = async (deptId: string) => {
        const input = rowInputs[deptId];
        const dept = departments.find(d => d._id === deptId);
        if (!dept || !input) return;

        const updatedUsername = input.username || dept.username;
        const updatedPassword = input.password || dept.password;

        if (!updatedUsername || !updatedPassword) return;

        setUpdatingCreds(deptId);
        try {
            const res = await fetch(`/api/resource/department/${deptId}?organizationId=${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: updatedUsername.trim(),
                    password: updatedPassword.trim()
                })
            });
            if (res.ok) {
                setDepartments(departments.map(d => d._id === deptId ? { ...d, username: updatedUsername, password: updatedPassword } : d));
                setSaveSuccess(deptId);
                setTimeout(() => setSaveSuccess(null), 3000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUpdatingCreds(null);
        }
    };


    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            <Workspace
                title="Department Development Center"
                hideActions={true}
                summaryItems={[
                    { label: 'Total Departments', value: departments.length, color: 'text-blue-600', doctype: 'department' },
                    { label: 'Active Portals', value: departments.length, color: 'text-emerald-600', doctype: 'department' }
                ]}
                masterCards={[]}
                shortcuts={[]}
            />

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h3 className="text-[18px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Building2 className="text-blue-600" size={24} />
                            Manage Departments
                        </h3>
                        <p className="text-[13px] text-gray-500">Create, customize, and configure department portals.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search departments..."
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-500 w-64"
                            />
                        </div>
                        <button
                            onClick={() => setShowDeptForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={16} /> Create Department
                        </button>
                    </div>
                </div>

                {/* Department Management Modal */}
                <DepartmentModal
                    isOpen={showDeptForm || !!editingDept || !!customizingDept}
                    onClose={() => {
                        setShowDeptForm(false);
                        setEditingDept(null);
                        setCustomizingDept(null);
                        setModalError('');
                    }}
                    error={modalError}
                    initialData={editingDept || customizingDept}
                    onSave={async (data) => {
                        setModalError('');
                        if (editingDept || customizingDept) {
                            const target = editingDept || customizingDept;
                            try {
                                const res = await fetch(`/api/resource/department/${target._id}?organizationId=${orgId}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(data)
                                });
                                if (res.ok) {
                                    const updated = await res.json();
                                    setDepartments(departments.map(d => d._id === target._id ? updated.data : d));
                                    setEditingDept(null);
                                    setCustomizingDept(null);
                                } else {
                                    const err = await res.json();
                                    setModalError(err.error || 'Failed to update department');
                                }
                            } catch (e) {
                                console.error(e);
                                setModalError('Network error occurred');
                            }
                        } else {
                            // Add New
                            try {
                                const res = await fetch(`/api/resource/department?organizationId=${orgId}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ...data, organizationId: orgId })
                                });
                                if (res.ok) {
                                    const created = await res.json();
                                    setDepartments([...departments, created.data]);
                                    setShowDeptForm(false);
                                } else {
                                    const err = await res.json();
                                    setModalError(err.error || 'Failed to create department');
                                }
                            } catch (e) {
                                console.error(e);
                                setModalError('Network error occurred');
                            }
                        }
                    }}
                    title={editingDept ? `Edit ${editingDept.name}` : customizingDept ? `Customize ${customizingDept.name}` : 'Launch New Department'}
                />

                {/* Department Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDepartments.map(dept => (
                        <div key={dept._id} className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm hover:shadow-md transition-shadow group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${dept.panelType === 'HR' ? 'bg-purple-100 text-purple-600' :
                                    dept.panelType === 'Finance' ? 'bg-emerald-100 text-emerald-600' :
                                        dept.panelType === 'Operations' ? 'bg-orange-100 text-orange-600' :
                                            'bg-blue-50 text-blue-600'
                                    }`}>
                                    <Building2 size={24} />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setCustomizingDept(dept)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                        title="Customize Portal"
                                    >
                                        <Pen size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDept(dept._id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h4 className="text-[16px] font-bold text-[#1d2129] mb-1">{dept.name}</h4>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{dept.code}</span>
                                <span className={`text-[11px] px-2 py-0.5 rounded font-bold border ${dept.panelType === 'HR' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                    dept.panelType === 'Finance' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        dept.panelType === 'Operations' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>{dept.panelType || 'Generic'}</span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 space-y-2 mb-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Admin Username</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] font-medium text-gray-700">{dept.username || 'Not set'}</span>
                                        <button
                                            onClick={() => setRowInputs(prev => ({ ...prev, [dept._id]: { ...prev[dept._id], username: dept.username, show: true } }))}
                                            className="text-blue-600 hover:underline text-[10px]"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    {rowInputs[dept._id]?.show && (
                                        <div className="animate-in slide-in-from-top-1">
                                            <input
                                                className="w-full text-[12px] border rounded px-2 py-1 mb-1 focus:border-blue-500 outline-none"
                                                placeholder="New Username"
                                                onChange={e => setRowInputs(prev => ({ ...prev, [dept._id]: { ...prev[dept._id], username: e.target.value } }))}
                                            />
                                            <div className="relative">
                                                <input
                                                    className="w-full text-[12px] border rounded px-2 py-1 focus:border-blue-500 outline-none"
                                                    placeholder="New Password"
                                                    onChange={e => setRowInputs(prev => ({ ...prev, [dept._id]: { ...prev[dept._id], password: e.target.value } }))}
                                                />
                                                <button
                                                    onClick={() => handleUpdateCreds(dept._id)}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    to={`/organization/department/${dept._id}`}
                                    className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Details
                                </Link>
                                <Link
                                    to={`/department-login?deptId=${dept._id}`}
                                    className="flex-[2] text-center py-2 bg-blue-600 text-white rounded-lg text-[12px] font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    Login to Portal <LogOut size={14} className="rotate-180" />
                                </Link>
                            </div>

                            {updatingCreds === dept._id && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                                    <span className="text-[12px] font-bold text-blue-600 animate-pulse">Updating Credentials...</span>
                                </div>
                            )}
                            {saveSuccess === dept._id && (
                                <div className="absolute inset-0 bg-emerald-50/90 flex items-center justify-center rounded-xl">
                                    <span className="text-[12px] font-bold text-emerald-600 flex items-center gap-1"><Shield size={16} /> Saved Successfully</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {
                    filteredDepartments.length === 0 && !loading && (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <Building2 className="mx-auto text-gray-300 mb-4" size={48} />
                            <h3 className="text-gray-900 font-bold mb-1">No Departments Found</h3>
                            <p className="text-gray-500 text-[13px] mb-4">Get started by creating your first department portal.</p>
                            <button onClick={() => setShowDeptForm(true)} className="text-blue-600 font-bold text-[13px] hover:underline">Create Department</button>
                        </div>
                    )
                }
            </div >

        </div >
    );
}
