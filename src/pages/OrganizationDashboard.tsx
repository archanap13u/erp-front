
import React, { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    School,
    Users,
    UserCheck,
    CalendarDays,
    Megaphone,
    TrendingUp,
    Plus,
    Building2,
    LogOut,
    Lock,
    Unlock,
    Search,
    Filter,
    ArrowRight,
    Trash2,
    Activity,
    Clock,
    User,
    Shield,
    Briefcase,
    BadgeDollarSign,
    FileText,
    ChevronRight,
    GraduationCap,
    Pen,
    Settings
} from 'lucide-react';
import Workspace from '../components/Workspace';
import { Link } from 'react-router-dom';
import CustomizationModal from '../components/CustomizationModal';

export default function OrganizationDashboard() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [org, setOrg] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [designations, setDesignations] = useState<string[]>([]);
    const [showDeptForm, setShowDeptForm] = useState(false);
    const [editingDept, setEditingDept] = useState<any>(null); // For customization
    const [newDept, setNewDept] = useState({ name: '', code: '', username: '', password: '', panelType: 'Generic', features: [] as string[] });
    const [updatingCreds, setUpdatingCreds] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [rowInputs, setRowInputs] = useState<Record<string, { username?: string, password?: string, panelType?: string }>>({});
    const [customizingDept, setCustomizingDept] = useState<any | null>(null);

    const orgId = localStorage.getItem('organization_id');

    useEffect(() => {
        if (!orgId) return;

        async function fetchData() {
            try {
                const query = `?organizationId=${orgId}`;

                const responses = await Promise.all([
                    fetch(`/api/resource/organization/${orgId}`),
                    fetch(`/api/resource/employee${query}`),
                    fetch(`/api/resource/department${query}`),
                    fetch(`/api/resource/attendance${query}`)
                ]);

                const [jsonOrg, jsonEmp, jsonDept, jsonAtt] = await Promise.all(
                    responses.map(r => r.json())
                );

                setOrg(jsonOrg.data);
                const empData = jsonEmp.data || [];
                setEmployees(empData);
                setDepartments(jsonDept.data || []);
                setAttendance(jsonAtt.data || []);

                const uniqueDesigs: string[] = Array.from(new Set(empData.map((e: any) => e.designation))).filter(Boolean) as string[];
                setDesignations(uniqueDesigs);
                setCounts({
                    employee: jsonEmp.data?.length || 0,
                    department: jsonDept.data?.length || 0,
                    attendance: jsonAtt.data?.length || 0
                });

            } catch (e) {
                console.error('Error fetching dashboard data:', e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [orgId]);

    const [deptDesignations, setDeptDesignations] = useState<string[]>(['Manager', 'Team Lead', 'Associate']); // Default suggestions
    const [desigInput, setDesigInput] = useState('');

    const handleAddDept = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDept.name || !newDept.code) return;

        try {
            const res = await fetch(`/api/resource/department?organizationId=${orgId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newDept, organizationId: orgId })
            });

            if (res.ok) {
                const data = await res.json();
                const newDeptId = data.data._id;

                // Create Designations
                if (deptDesignations.length > 0 && newDeptId) {
                    await Promise.all(deptDesignations.map((title, idx) =>
                        fetch(`/api/resource/designation?organizationId=${orgId}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                title,
                                departmentId: newDeptId,
                                organizationId: orgId,
                                level: idx + 1 // Auto-assign hierarchy level based on order
                            })
                        })
                    ));
                }

                setDepartments([...departments, data.data]);
                setNewDept({ name: '', code: '', username: '', password: '', panelType: 'Generic', features: [] });
                setDeptDesignations(['Manager', 'Team Lead', 'Associate']); // Reset
                setShowDeptForm(false);
                setCounts(prev => ({ ...prev, department: (prev.department || 0) + 1 }));
                setSaveSuccess('Department created with designations!');
                setTimeout(() => setSaveSuccess(null), 3000);
            }
        } catch (e) {
            console.error('Error adding department:', e);
        }
    };

    const addDesignation = () => {
        if (desigInput && !deptDesignations.includes(desigInput)) {
            setDeptDesignations([...deptDesignations, desigInput]);
            setDesigInput('');
        }
    };

    const removeDesignation = (idx: number) => {
        setDeptDesignations(deptDesignations.filter((_, i) => i !== idx));
    };

    const handleDeleteDept = async (e: React.MouseEvent, deptId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this panel/department? All credentials will be removed.')) return;

        try {
            const res = await fetch(`/api/resource/department/${deptId}?organizationId=${orgId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setDepartments(departments.filter(d => d._id !== deptId));
                setCounts(prev => ({ ...prev, department: (prev.department || 0) - 1 }));
            }
        } catch (e) {
            console.error('Error deleting department:', e);
        }
    };

    const handleUpdateCreds = async (deptId: string) => {
        const input = rowInputs[deptId];
        const dept = departments.find(d => d._id === deptId);
        if (!dept) return;

        const updatedUsername = input?.username || dept.username;
        const updatedPassword = input?.password || dept.password;
        const updatedPanelType = input?.panelType || dept.panelType || 'Generic'; // Validate/Default

        if (!updatedUsername || !updatedPassword) return;

        setUpdatingCreds(deptId);
        try {
            const res = await fetch(`/api/resource/department/${deptId}?organizationId=${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: updatedUsername,
                    password: updatedPassword,
                    panelType: updatedPanelType
                })
            });
            if (res.ok) {
                setDepartments(departments.map(d =>
                    d._id === deptId ? {
                        ...d,
                        username: updatedUsername,
                        password: updatedPassword,
                        panelType: updatedPanelType
                    } : d
                ));
                setRowInputs(prev => {
                    const next = { ...prev };
                    delete next[deptId];
                    return next;
                });
                setSaveSuccess(deptId);
                setTimeout(() => setSaveSuccess(null), 3000);
            }
        } catch (e) {
            console.error('Error updating credentials:', e);
        } finally {
            setUpdatingCreds(null);
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
            console.error('Error saving department customizations:', e);
        }
    };

    const handleSaveFeatures = async (newFeatures: string[]) => {
        if (!customizingDept) return;

        // If customizing a new department (during creation)
        if (customizingDept._id === 'new') {
            setNewDept({ ...newDept, features: newFeatures });
            setCustomizingDept(null);
            return;
        }

        // Otherwise, update existing department
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

    const maxEmployees = org?.subscription?.maxEmployees || 0;
    const totalUsers = (counts.employee || 0) + (counts.student || 0);
    const empPercentage = maxEmployees > 0 ? Math.min((counts.employee / maxEmployees) * 100, 100) : 0;

    return (
        <div className="space-y-8 pb-20">
            <Workspace
                title={`${org?.name || 'Organization'} - Multi-Department Dashboard`}
                onCustomize={() => alert('Global Organization customization coming soon!')}
                summaryItems={[
                    { label: 'Active Depts', value: loading ? '...' : counts.department || 0, color: 'text-purple-500', doctype: 'department' },
                    { label: 'Total Staff', value: loading ? '...' : counts.employee || 0, color: 'text-blue-500', doctype: 'employee' },
                    { label: 'Daily Attendance', value: loading ? '...' : counts.attendance || 0, color: 'text-emerald-500', doctype: 'attendance' },
                ]}
                masterCards={[
                    { label: 'Departments', icon: Building2, count: '', href: '/department' },
                    { label: 'All Staffs', icon: Users, count: '', href: '/employee' },
                    { label: 'System Access', icon: Shield, count: '', href: '#' },
                ]}
                shortcuts={[
                    { label: 'Create Department', href: '#' },
                    { label: 'Customize Departments', href: '/organization/departments' },
                    { label: 'Manage Roles', href: '#' },
                    { label: 'Export Reports', href: '#' },
                ]}
            />

            {editingDept && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-[#1d2129] flex items-center gap-2">
                                <Building2 size={18} className="text-blue-600" />
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
                                    value={editingDept.panelType}
                                    onChange={e => {
                                        const type = e.target.value;
                                        let updatedFeatures = [...(editingDept.features || [])];
                                        if (type === 'HR') {
                                            const hrDefaults = ['Add Employee', 'Post Vacancy', 'Employee Transfer'];
                                            hrDefaults.forEach(f => {
                                                if (!updatedFeatures.includes(f)) updatedFeatures.push(f);
                                            });
                                        }
                                        setEditingDept({ ...editingDept, panelType: type, features: updatedFeatures });
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="Generic">Generic (Default)</option>
                                    <option value="HR">HR Workspace</option>
                                    <option value="Operations">Operations Workspace</option>
                                    <option value="Finance">Finance Workspace</option>
                                </select>
                                <p className="text-[11px] text-gray-500 mt-1">Changes which dashboard this department sees on login.</p>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2 pt-2 border-t border-gray-100">
                                <label className="block text-[12px] font-bold text-gray-700 mb-1">Available Functions</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'Add Employee', 'Post Vacancy', 'Employee Transfer',
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
            )}

            {/* Department Visibility Grid */}
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[18px] font-bold text-[#1d2129]">Department Portals</h3>
                        <p className="text-[13px] text-gray-500">Global visibility across all subunits</p>
                    </div>
                    <button
                        onClick={() => setShowDeptForm(!showDeptForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> New Department
                    </button>
                </div>

                {showDeptForm && (
                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 animate-in slide-in-from-top duration-300">
                        <form onSubmit={handleAddDept} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-blue-700 uppercase">Dept Name (Panel)</label>
                                <input
                                    value={newDept.name}
                                    onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                    placeholder="e.g. Finance"
                                    className="w-full bg-white border border-blue-200 px-3 py-2 rounded focus:outline-none focus:border-blue-500 text-[13px]"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-blue-700 uppercase">Code</label>
                                <input value={newDept.code} onChange={e => setNewDept({ ...newDept, code: e.target.value })} className="w-full bg-white border border-blue-200 px-3 py-2 rounded focus:outline-none focus:border-blue-500 text-[13px]" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-blue-700 uppercase">Admin Username</label>
                                <input value={newDept.username} onChange={e => setNewDept({ ...newDept, username: e.target.value })} placeholder="e.g. hr_admin" className="w-full bg-white border border-blue-200 px-3 py-2 rounded focus:outline-none focus:border-blue-500 text-[13px]" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-blue-700 uppercase">Admin Password</label>
                                <input value={newDept.password} onChange={e => setNewDept({ ...newDept, password: e.target.value })} type="text" placeholder="Set password" className="w-full bg-white border border-blue-200 px-3 py-2 rounded focus:outline-none focus:border-blue-500 text-[13px]" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-blue-700 uppercase">Panel Interface</label>
                                <select
                                    value={newDept.panelType}
                                    onChange={e => {
                                        const type = e.target.value;
                                        let updatedFeatures = [...(newDept.features || [])];
                                        if (type === 'HR') {
                                            const hrDefaults = ['Add Employee', 'Post Vacancy', 'Employee Transfer'];
                                            hrDefaults.forEach(f => {
                                                if (!updatedFeatures.includes(f)) updatedFeatures.push(f);
                                            });
                                        }
                                        setNewDept({ ...newDept, panelType: type, features: updatedFeatures });
                                    }}
                                    className="w-full bg-white border border-blue-200 px-3 py-2 rounded focus:outline-none focus:border-blue-500 text-[13px]"
                                    required
                                >
                                    <option value="Generic">Generic (Default)</option>
                                    <option value="HR">HR Workspace</option>
                                    <option value="Operations">Operations Workspace</option>
                                    <option value="Finance">Finance Workspace</option>
                                </select>
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[11px] font-bold text-blue-700 uppercase">Initial Designations</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        value={desigInput}
                                        onChange={e => setDesigInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDesignation())}
                                        placeholder="e.g. Manager"
                                        className="flex-1 bg-white border border-blue-200 px-3 py-2 rounded focus:outline-none focus:border-blue-500 text-[13px]"
                                    />
                                    <button
                                        type="button"
                                        onClick={addDesignation}
                                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded font-bold text-[13px] hover:bg-blue-200"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 min-h-[30px] bg-blue-50/50 p-2 rounded border border-blue-100">
                                    {deptDesignations.length === 0 ? (
                                        <span className="text-[11px] text-gray-400 italic">No designations added yet.</span>
                                    ) : (
                                        deptDesignations.map((d, idx) => (
                                            <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 text-blue-700 rounded text-[11px] font-bold shadow-sm">
                                                {d}
                                                <button type="button" onClick={() => removeDesignation(idx)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 size={10} />
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1 md:col-span-4">
                                <label className="text-[11px] font-bold text-blue-700 uppercase">Functions / Features</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomizingDept({ ...newDept, _id: 'new', name: newDept.name || 'New Department' });
                                    }}
                                    className="w-full bg-white border border-blue-200 px-4 py-3 rounded hover:bg-blue-50 hover:border-blue-400 transition-all text-left flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-2">
                                        <Settings size={16} className="text-blue-600" />
                                        <span className="text-[13px] font-medium text-[#1d2129]">
                                            {(newDept.features || []).length > 0
                                                ? `${newDept.features.length} feature${newDept.features.length !== 1 ? 's' : ''} selected`
                                                : 'Select Features'}
                                        </span>
                                    </div>
                                    <ArrowRight size={14} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                                {(newDept.features || []).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {newDept.features.slice(0, 8).map(feat => (
                                            <span key={feat} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
                                                {feat}
                                            </span>
                                        ))}
                                        {newDept.features.length > 8 && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                                                +{newDept.features.length - 8} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold text-[13px] hover:bg-blue-700 flex-1">Create Panel</button>
                                <button type="button" onClick={() => setShowDeptForm(false)} className="bg-white text-gray-500 border border-gray-200 px-6 py-2 rounded font-bold text-[13px] hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map(dept => {
                        const deptEmps = employees.filter(e => e.department === dept.name);
                        const empIds = deptEmps.map(e => e.employeeId);
                        const deptAtt = attendance.filter(a => empIds.includes(a.employee) && a.status === 'Present');
                        return (
                            <Link key={dept._id} to={`/department-login?deptId=${dept._id}`} className="group no-underline">
                                <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm hover:border-blue-400 hover:shadow-md transition-all h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                                            <Building2 size={24} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                                                {deptAtt.length} Active Today
                                            </p>
                                        </div>
                                    </div>
                                    <h4 className="text-[16px] font-bold text-[#1d2129] mb-1">{dept.name}</h4>
                                    <div className="space-y-1 mb-4">
                                        <p className="text-[12px] text-gray-500 font-medium">Code: {dept.code}</p>
                                        <div className="flex items-center gap-2 text-[11px] text-blue-600 bg-blue-50/50 px-2 py-1 rounded">
                                            <User size={10} /> <span>{dept.username || 'No User'}</span>
                                            <span className="text-gray-300">|</span>
                                            <Lock size={10} /> <span>{dept.password || 'No Pass'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[12px]">
                                            <span className="text-gray-500 flex items-center gap-1"><Users size={12} /> Staff</span>
                                            <span className="font-bold text-[#1d2129]">{deptEmps.length}</span>
                                        </div>
                                        <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-400 h-full" style={{ width: `${Math.min((deptEmps.length / 20) * 100, 100)}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-blue-600 text-[12px] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                            Enter Dashboard <ArrowRight size={14} />
                                        </span>
                                        <button
                                            onClick={(e) => handleDeleteDept(e, dept._id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Panel"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setCustomizingDept(dept);
                                            }}
                                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors ml-1"
                                            title="Customize Features"
                                        >
                                            <Pen size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Global Activity Feed */}
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-[#1d2129]">
                            <Activity size={18} className="text-blue-600" />
                            Recent Organizational Activity
                        </div>
                    </div>
                    <div className="flex-1 divide-y divide-gray-50">
                        {attendance.length === 0 ? (
                            <div className="p-10 text-center text-gray-400 italic text-[13px]">No recent multi-department activity found.</div>
                        ) : (
                            attendance.slice(0, 6).map((att) => (
                                <div key={att._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{att.employeeName}</p>
                                            <p className="text-[11px] text-gray-500">Marked <span className="text-blue-600 font-medium">{att.status}</span> • Across Organization</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] text-gray-400">{new Date(att.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Resource Allocation & Summary */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                        <h3 className="text-[16px] font-bold text-[#1d2129] mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-blue-600" />
                            System Utilization
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[13px] mb-2">
                                    <span className="text-gray-600 font-medium">Headcount Allocation</span>
                                    <span className="font-bold text-blue-600">{counts.employee} / {maxEmployees}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div className={`h-full transition-all duration-500 ${counts.employee >= maxEmployees ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${empPercentage}%` }} />
                                </div>
                                <p className="text-[11px] text-gray-400 mt-2 italic">Total active staff seats assigned by Super Admin</p>
                            </div>

                            <div className="pt-4 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                                    <p className="text-[11px] font-bold text-purple-600 uppercase tracking-tighter">Growth</p>
                                    <p className="text-2xl font-black text-purple-700">+{counts.department * 2}%</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-tighter">Efficiency</p>
                                    <p className="text-2xl font-black text-emerald-700">92%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100">
                        <h4 className="text-[14px] font-bold text-blue-800 mb-2">Administrative Actions</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="bg-white text-blue-700 px-3 py-2 rounded border border-blue-100 text-[12px] font-bold hover:bg-blue-50 transition-colors">Export Reporting</button>
                            <button className="bg-white text-blue-700 px-3 py-2 rounded border border-blue-100 text-[12px] font-bold hover:bg-blue-50 transition-colors">Audit Logs</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Credential Management Section */}
            <div className="max-w-6xl mx-auto mt-12">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-[#1d2129]">
                            <Shield size={18} className="text-blue-600" />
                            System Access & Credentials
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <p className="text-[11px] text-gray-500 italic">Manage login access for your functional panels</p>
                            <p className="text-[10px] text-blue-500 font-medium">Tip: Use unique usernames (e.g. hr@orgname) for best reliability.</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[13px]">
                            <thead className="bg-[#f9fafb] border-b border-[#d1d8dd] text-[#8d99a6] font-bold uppercase">
                                <tr>
                                    <th className="px-4 py-2">Role / Panel</th>
                                    <th className="px-4 py-2">Staff Name</th>
                                    <th className="px-4 py-2">Dashboard Type</th>
                                    <th className="px-4 py-2">Set Username</th>
                                    <th className="px-4 py-2">Set Password</th>
                                    <th className="px-4 py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {departments.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 italic">No departments found to manage.</td></tr>
                                ) : (
                                    departments.map((dept) => (
                                        <tr key={dept._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${(rowInputs[dept._id]?.panelType || dept.panelType) === 'HR' ? 'bg-purple-100 text-purple-700' :
                                                    (rowInputs[dept._id]?.panelType || dept.panelType) === 'Operations' ? 'bg-orange-100 text-orange-700' :
                                                        (rowInputs[dept._id]?.panelType || dept.panelType) === 'Finance' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {((rowInputs[dept._id]?.panelType || dept.panelType) || 'Generic').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-[#1d2129]">{dept.name}</div>
                                                <div className="text-[11px] text-gray-500">{dept.code}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <select
                                                    value={rowInputs[dept._id]?.panelType ?? dept.panelType ?? 'Generic'}
                                                    onChange={e => setRowInputs(prev => ({ ...prev, [dept._id]: { ...prev[dept._id], panelType: e.target.value } }))}
                                                    className="w-full bg-white border border-gray-200 px-2 py-1 rounded focus:outline-none focus:border-blue-400 text-[12px]"
                                                >
                                                    <option value="Generic">Generic</option>
                                                    <option value="HR">HR Workspace</option>
                                                    <option value="Operations">Operations</option>
                                                    <option value="Finance">Finance Workspace</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-4">
                                                <input
                                                    value={rowInputs[dept._id]?.username ?? ''}
                                                    placeholder={dept.username || "Set username..."}
                                                    onChange={e => setRowInputs(prev => ({ ...prev, [dept._id]: { ...prev[dept._id], username: e.target.value } }))}
                                                    className="w-full bg-white border border-gray-200 px-2 py-1 rounded focus:outline-none focus:border-blue-400 text-[12px]"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <input
                                                    type="text"
                                                    value={rowInputs[dept._id]?.password ?? ''}
                                                    placeholder={dept.password || "Set password..."}
                                                    onChange={e => setRowInputs(prev => ({ ...prev, [dept._id]: { ...prev[dept._id], password: e.target.value } }))}
                                                    className="w-full bg-white border border-gray-200 px-2 py-1 rounded focus:outline-none focus:border-blue-400 text-[12px]"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => handleUpdateCreds(dept._id)}
                                                    disabled={updatingCreds === dept._id || !rowInputs[dept._id]?.username || !rowInputs[dept._id]?.password}
                                                    className={`px-3 py-1.5 rounded text-[11px] font-bold text-white w-full transition-all ${saveSuccess === dept._id ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
                                                        } disabled:bg-gray-200 disabled:text-gray-400`}
                                                >
                                                    {updatingCreds === dept._id ? 'Saving...' : saveSuccess === dept._id ? '✓ Saved!' : 'Update Access'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CustomizationModal
                isOpen={!!customizingDept}
                onClose={() => setCustomizingDept(null)}
                currentFeatures={customizingDept?.features || []}
                onSave={handleSaveFeatures}
                title={`${customizingDept?.name} Customization`}
            />
        </div>
    );
}

