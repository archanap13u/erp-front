
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
import CustomizationModal from '../components/CustomizationModal';

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

    const handleAddDept = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDept.name || !newDept.code) return;

        try {
            const res = await fetch(`/api/resource/department?organizationId=${orgId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newDept,
                    username: newDept.username.trim(),
                    password: newDept.password.trim(),
                    organizationId: orgId
                })
            });
            if (res.ok) {
                const data = await res.json();
                setDepartments([...departments, data.data]);
                setNewDept({ name: '', code: '', username: '', password: '', panelType: 'Generic', features: [] });
                setShowDeptForm(false);
            }
        } catch (e) {
            console.error(e);
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

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDept || !editingDept.name) return;

        try {
            const res = await fetch(`/api/resource/department/${editingDept._id}?organizationId=${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editingDept.name,
                    code: editingDept.code,
                    panelType: editingDept.panelType,
                    features: editingDept.features
                })
            });
            if (res.ok) {
                setDepartments(departments.map(d => d._id === editingDept._id ? { ...d, ...editingDept } : d));
                setEditingDept(null);
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

    const handleSaveFeatures = async (newFeatures: string[]) => {
        if (!customizingDept) return;
        try {
            const res = await fetch(`/api/resource/department/${customizingDept._id}?organizationId=${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: newFeatures })
            });
            if (res.ok) {
                setDepartments(departments.map(d => d._id === customizingDept._id ? { ...d, features: newFeatures } : d));
                setCustomizingDept(null);
            }
        } catch (e) {
            console.error('Error saving features:', e);
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

                {/* Create Form */}
                {showDeptForm && (
                    <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-lg mb-8 animate-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-blue-800">New Department Setup</h4>
                            <button onClick={() => setShowDeptForm(false)} className="text-gray-400 hover:text-gray-600"><LogOut size={16} /></button>
                        </div>
                        <form onSubmit={handleAddDept} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Name</label>
                                <input required value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} className="w-full border p-2 rounded text-[13px]" placeholder="e.g. Finance" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Code</label>
                                <input required value={newDept.code} onChange={e => setNewDept({ ...newDept, code: e.target.value })} className="w-full border p-2 rounded text-[13px]" placeholder="e.g. FIN-01" />
                            </div>
                            <div className="space-y-1">
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Admin User</label>
                                <input required value={newDept.username} onChange={e => setNewDept({ ...newDept, username: e.target.value })} className="w-full border p-2 rounded text-[13px]" placeholder="Username" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Password</label>
                                <input required value={newDept.password} onChange={e => setNewDept({ ...newDept, password: e.target.value })} className="w-full border p-2 rounded text-[13px]" placeholder="Password" />
                            </div>
                            <div className="lg:col-span-5 space-y-4 pt-2 border-t border-gray-100">
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Department Modules & Functionalities</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {/* HR Module */}
                                    <div className={`p-3 rounded-lg border cursor-pointer transition-all ${newDept.panelType === 'HR' ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-400' : 'bg-white border-gray-200 hover:border-purple-200'}`}
                                        onClick={() => {
                                            const hrFeats = ['Attendance', 'Recruitment', 'Payroll', 'Employee Lifecycle', 'Shift Management'];
                                            const isActive = hrFeats.every(f => newDept.features.includes(f));
                                            let newFeats = [...newDept.features];
                                            if (isActive) newFeats = newFeats.filter(f => !hrFeats.includes(f));
                                            else newFeats = [...new Set([...newFeats, ...hrFeats])];
                                            setNewDept({ ...newDept, features: newFeats, panelType: isActive ? 'Generic' : 'HR' });
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-3 h-3 rounded-full border ${newDept.features.includes('Attendance') ? 'bg-purple-500 border-purple-500' : 'border-gray-300'}`} />
                                            <span className="font-bold text-[13px] text-gray-800">HR & Payroll</span>
                                        </div>
                                    </div>

                                    {/* Finance Module */}
                                    <div className={`p-3 rounded-lg border cursor-pointer transition-all ${newDept.panelType === 'Finance' ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-400' : 'bg-white border-gray-200 hover:border-emerald-200'}`}
                                        onClick={() => {
                                            const finFeats = ['Invoices', 'Payments', 'Expenses', 'General Ledger', 'Taxation'];
                                            const isActive = finFeats.every(f => newDept.features.includes(f));
                                            let newFeats = [...newDept.features];
                                            if (isActive) newFeats = newFeats.filter(f => !finFeats.includes(f));
                                            else newFeats = [...new Set([...newFeats, ...finFeats])];
                                            setNewDept({ ...newDept, features: newFeats, panelType: isActive ? 'Generic' : 'Finance' });
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-3 h-3 rounded-full border ${newDept.features.includes('Invoices') ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`} />
                                            <span className="font-bold text-[13px] text-gray-800">Finance & Accounts</span>
                                        </div>
                                    </div>

                                    {/* Operations/Ed Module */}
                                    <div className={`p-3 rounded-lg border cursor-pointer transition-all ${newDept.panelType === 'Operations' ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-400' : 'bg-white border-gray-200 hover:border-orange-200'}`}
                                        onClick={() => {
                                            const opsFeats = ['University', 'Study Center', 'Applications', 'Student Records', 'Programs'];
                                            const isActive = opsFeats.every(f => newDept.features.includes(f));
                                            let newFeats = [...newDept.features];
                                            if (isActive) newFeats = newFeats.filter(f => !opsFeats.includes(f));
                                            else newFeats = [...new Set([...newFeats, ...opsFeats])];
                                            setNewDept({ ...newDept, features: newFeats, panelType: isActive ? 'Generic' : 'Operations' });
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-3 h-3 rounded-full border ${newDept.features.includes('University') ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`} />
                                            <span className="font-bold text-[13px] text-gray-800">Education Ops</span>
                                        </div>
                                    </div>

                                    {/* Inventory Module */}
                                    <div className={`p-3 rounded-lg border cursor-pointer transition-all ${newDept.panelType === 'Inventory' ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-400' : 'bg-white border-gray-200 hover:border-amber-200'}`}
                                        onClick={() => {
                                            const invFeats = ['Stock Entry', 'Delivery Note', 'Purchase Receipt', 'Item Management', 'Warehouses'];
                                            const isActive = invFeats.every(f => newDept.features.includes(f));
                                            let newFeats = [...newDept.features];
                                            if (isActive) newFeats = newFeats.filter(f => !invFeats.includes(f));
                                            else newFeats = [...new Set([...newFeats, ...invFeats])];
                                            setNewDept({ ...newDept, features: newFeats, panelType: isActive ? 'Generic' : 'Inventory' });
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-3 h-3 rounded-full border ${newDept.features.includes('Stock Entry') ? 'bg-amber-500 border-amber-500' : 'border-gray-300'}`} />
                                            <span className="font-bold text-[13px] text-gray-800">Inventory & Stock</span>
                                        </div>
                                    </div>

                                    {/* CRM Module */}
                                    <div className={`p-3 rounded-lg border cursor-pointer transition-all ${newDept.panelType === 'CRM' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-400' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                                        onClick={() => {
                                            const crmFeats = ['Leads', 'Deals', 'Customers', 'Touchpoints', 'Quotations', 'Sales Orders'];
                                            const isActive = crmFeats.every(f => newDept.features.includes(f));
                                            let newFeats = [...newDept.features];
                                            if (isActive) newFeats = newFeats.filter(f => !crmFeats.includes(f));
                                            else newFeats = [...new Set([...newFeats, ...crmFeats])];
                                            setNewDept({ ...newDept, features: newFeats, panelType: isActive ? 'Generic' : 'CRM' });
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-3 h-3 rounded-full border ${newDept.features.includes('Leads') ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`} />
                                            <span className="font-bold text-[13px] text-gray-800">CRM & Sales</span>
                                        </div>
                                    </div>

                                    {/* Projects Module */}
                                    <div className={`p-3 rounded-lg border cursor-pointer transition-all ${newDept.panelType === 'Projects' ? 'bg-pink-50 border-pink-200 ring-1 ring-pink-400' : 'bg-white border-gray-200 hover:border-pink-200'}`}
                                        onClick={() => {
                                            const projFeats = ['Projects', 'Tasks', 'Timesheets', 'Agile Board'];
                                            const isActive = projFeats.every(f => newDept.features.includes(f));
                                            let newFeats = [...newDept.features];
                                            if (isActive) newFeats = newFeats.filter(f => !projFeats.includes(f));
                                            else newFeats = [...new Set([...newFeats, ...projFeats])];
                                            setNewDept({ ...newDept, features: newFeats, panelType: isActive ? 'Generic' : 'Projects' });
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-3 h-3 rounded-full border ${newDept.features.includes('Projects') ? 'bg-pink-500 border-pink-500' : 'border-gray-300'}`} />
                                            <span className="font-bold text-[13px] text-gray-800">Projects</span>
                                        </div>
                                    </div>

                                    {/* Support Module */}
                                    <div className={`p-3 rounded-lg border cursor-pointer transition-all ${newDept.panelType === 'Support' ? 'bg-cyan-50 border-cyan-200 ring-1 ring-cyan-400' : 'bg-white border-gray-200 hover:border-cyan-200'}`}
                                        onClick={() => {
                                            const suppFeats = ['Tickets', 'Issues', 'Warranty Claims', 'Knowledge Base'];
                                            const isActive = suppFeats.every(f => newDept.features.includes(f));
                                            let newFeats = [...newDept.features];
                                            if (isActive) newFeats = newFeats.filter(f => !suppFeats.includes(f));
                                            else newFeats = [...new Set([...newFeats, ...suppFeats])];
                                            setNewDept({ ...newDept, features: newFeats, panelType: isActive ? 'Generic' : 'Support' });
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-3 h-3 rounded-full border ${newDept.features.includes('Tickets') ? 'bg-cyan-500 border-cyan-500' : 'border-gray-300'}`} />
                                            <span className="font-bold text-[13px] text-gray-800">Helpdesk</span>
                                        </div>
                                    </div>

                                    {/* Assets Module */}
                                    <div className={`p-3 rounded-lg border cursor-pointer transition-all ${newDept.panelType === 'Assets' ? 'bg-slate-50 border-slate-200 ring-1 ring-slate-400' : 'bg-white border-gray-200 hover:border-slate-200'}`}
                                        onClick={() => {
                                            const assetFeats = ['Asset Tracking', 'Maintenance', 'Depreciation'];
                                            const isActive = assetFeats.every(f => newDept.features.includes(f));
                                            let newFeats = [...newDept.features];
                                            if (isActive) newFeats = newFeats.filter(f => !assetFeats.includes(f));
                                            else newFeats = [...new Set([...newFeats, ...assetFeats])];
                                            setNewDept({ ...newDept, features: newFeats, panelType: isActive ? 'Generic' : 'Assets' });
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-3 h-3 rounded-full border ${newDept.features.includes('Asset Tracking') ? 'bg-slate-500 border-slate-500' : 'border-gray-300'}`} />
                                            <span className="font-bold text-[13px] text-gray-800">Asset Mgmt</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-2">Available Functions</div>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            'Attendance', 'Recruitment', 'Payroll', 'Employee Lifecycle', 'Shift Management', 'Holidays', 'Announcements',
                                            'Invoices', 'Payments', 'Expenses', 'General Ledger', 'Taxation',
                                            'University', 'Study Center', 'Applications', 'Student Records', 'Programs',
                                            'Stock Entry', 'Delivery Note', 'Purchase Receipt', 'Item Management', 'Warehouses', 'Suppliers',
                                            'Leads', 'Deals', 'Customers', 'Touchpoints', 'Quotations', 'Sales Orders',
                                            'Projects', 'Tasks', 'Timesheets', 'Agile Board',
                                            'Tickets', 'Issues', 'Warranty Claims', 'Knowledge Base',
                                            'Asset Tracking', 'Maintenance', 'Depreciation'
                                        ].map(feat => (
                                            <label key={feat} className={`flex items-center gap-1.5 px-2 py-1.5 rounded border cursor-pointer hover:bg-gray-100 transition-colors ${newDept.features.includes(feat) ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-gray-100 text-gray-600'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={newDept.features.includes(feat)}
                                                    onChange={e => {
                                                        if (e.target.checked) setNewDept({ ...newDept, features: [...newDept.features, feat] });
                                                        else setNewDept({ ...newDept, features: newDept.features.filter(f => f !== feat) });
                                                    }}
                                                    className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-[11px] font-medium">{feat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-5 flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowDeptForm(false)} className="px-4 py-2 text-[13px] border rounded hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-[13px] bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">Create Department</button>
                            </div>
                        </form>
                    </div>
                )
                }

                {/* Edit Modal */}
                {
                    editingDept && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-bold text-[#1d2129] flex items-center gap-2">
                                        <Pen size={18} className="text-blue-600" />
                                        Customize Department
                                    </h3>
                                    <button onClick={() => setEditingDept(null)} className="text-gray-400 hover:text-gray-600"><LogOut size={16} /></button>
                                </div>
                                <form onSubmit={handleEditSave} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Department Name</label>
                                        <input
                                            value={editingDept.name}
                                            onChange={e => setEditingDept({ ...editingDept, name: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:border-blue-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Department Code</label>
                                        <input
                                            value={editingDept.code}
                                            onChange={e => setEditingDept({ ...editingDept, code: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:border-blue-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Panel Function</label>
                                        <select
                                            value={editingDept.panelType || 'Generic'}
                                            onChange={e => {
                                                const type = e.target.value;
                                                let feats = editingDept.features || [];
                                                if (type === 'HR') feats = ['Recruitment', 'Payroll', 'Attendance'];
                                                if (type === 'Finance') feats = ['Invoices', 'Payments', 'Expenses'];
                                                if (type === 'Operations') feats = ['University', 'Study Center'];
                                                setEditingDept({ ...editingDept, panelType: type, features: feats });
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="Generic">Custom / Generic</option>
                                            <option value="HR">HR Standard</option>
                                            <option value="Finance">Finance Standard</option>
                                            <option value="Operations">Operations Standard</option>
                                        </select>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto space-y-2 pt-2 border-t border-gray-100">
                                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Available Functions</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                'Attendance', 'Recruitment', 'Payroll', 'Employee Lifecycle', 'Shift Management', 'Holidays', 'Announcements',
                                                'Invoices', 'Payments', 'Expenses', 'General Ledger', 'Taxation', 'Quotations', 'Sales Orders',
                                                'University', 'Study Center', 'Applications', 'Student Records', 'Programs',
                                                'Stock Entry', 'Delivery Note', 'Item Management', 'Purchase Receipt', 'Warehouses', 'Suppliers',
                                                'Leads', 'Deals', 'Customers', 'Touchpoints',
                                                'Projects', 'Tasks', 'Timesheets', 'Agile Board',
                                                'Tickets', 'Issues', 'Warranty Claims', 'Knowledge Base',
                                                'Asset Tracking', 'Maintenance', 'Depreciation'
                                            ].map(feat => (
                                                <label key={feat} className={`flex items-center gap-1.5 px-2 py-1.5 rounded border cursor-pointer hover:bg-gray-100 transition-colors ${(editingDept.features || []).includes(feat) ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-gray-100 text-gray-600'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={(editingDept.features || []).includes(feat)}
                                                        onChange={e => {
                                                            let newFeats = [...(editingDept.features || [])];
                                                            if (e.target.checked) newFeats.push(feat);
                                                            else newFeats = newFeats.filter(f => f !== feat);
                                                            setEditingDept({ ...editingDept, features: newFeats });
                                                        }}
                                                        className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-[11px] font-medium">{feat}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setEditingDept(null)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold text-[13px] hover:bg-gray-50">Cancel</button>
                                        <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-[13px] hover:bg-blue-700">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

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

                            <Link
                                to={`/organization/department/${dept._id}`}
                                className="block w-full text-center py-2 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                            >
                                View Details
                            </Link>

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

            <CustomizationModal
                isOpen={!!customizingDept}
                onClose={() => setCustomizingDept(null)}
                currentFeatures={customizingDept?.features || []}
                onSave={handleSaveFeatures}
                title={`${customizingDept?.name || ''} Portal Customization`}
            />
        </div >
    );
}
