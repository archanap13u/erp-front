import React, { useState, useEffect } from 'react';
import { UserPlus, Save, ArrowLeft, Building2, Briefcase, User, Mail, Lock, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Workspace from '../../components/Workspace';

export default function EmployeeOnboardingNew() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);
    const [vacancies, setVacancies] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        employeeName: '',
        email: '',
        username: '',
        password: '',
        department: '',
        departmentId: '',
        designation: '',
        reportsToRole: '', // Changed from reportsTo
        dateOfJoining: new Date().toISOString().split('T')[0],
        status: 'Active',
        vacancy: '', // Linked vacancy
        employeeId: `EMP-${Math.floor(Math.random() * 10000)}` // Temporary auto-gen
    });

    useEffect(() => {
        const orgId = localStorage.getItem('organization_id');
        // Fetch Departments
        fetch(`/api/resource/department?organizationId=${orgId}`)
            .then(res => res.json())
            .then(json => setDepartments(json.data || []))
            .catch(console.error);

        // Fetch Open Job Openings (Vacancies)
        fetch(`/api/resource/jobopening?organizationId=${orgId}`)
            .then(res => res.json())
            .then(json => {
                const openJobs = (json.data || []).filter((j: any) => j.status === 'Open');
                setVacancies(openJobs);
            })
            .catch(console.error);

        // Fetch All Designations (will filter client-side or we could fetch on dept change)
        fetch(`/api/resource/designation?organizationId=${orgId}`)
            .then(res => res.json())
            .then(json => setDesignations(json.data || []))
            .catch(console.error);

        // Fetch Potential Managers (All Active Employees)
        fetch(`/api/resource/employee?organizationId=${orgId}&status=Active`)
            .then(res => res.json())
            .then(json => setManagers(json.data || []))
            .catch(console.error);
    }, []);

    const handleVacancyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const vacancyId = e.target.value;
        const vacancy = vacancies.find(v => v._id === vacancyId || v.name === vacancyId);

        if (vacancy) {
            // Auto-fill from Vacancy
            // Find department object to get ID
            const dept = departments.find(d => d.name === vacancy.department);

            setFormData(prev => ({
                ...prev,
                vacancy: vacancyId,
                department: vacancy.department,
                departmentId: dept ? dept._id : '', // Try to match dept name to ID if possible
                designation: vacancy.job_title
            }));
        } else {
            setFormData(prev => ({ ...prev, vacancy: '' }));
        }
    };

    const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deptId = e.target.value;
        const dept = departments.find(d => d._id === deptId);
        setFormData(prev => ({
            ...prev,
            departmentId: deptId,
            department: dept ? dept.name : '',
            designation: '',
            reportsToRole: '' // Reset
        }));
    };

    // ... (handleSubmit needs to ignore reportsTo logic for now or mapped) ...

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const orgId = localStorage.getItem('organization_id');

        try {
            const res = await fetch('/api/resource/employee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    organizationId: orgId
                })
            });

            if (res.ok) {
                alert('Employee onboarded successfully!');
                navigate('/employee');
            } else {
                const json = await res.json();
                alert('Error: ' + (json.error || 'Failed to onboard employee'));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    // Filter designations based on selected department
    const filteredDesignations = formData.departmentId
        ? designations.filter(d => d.departmentId === formData.departmentId || d.departmentId?._id === formData.departmentId)
        : designations;

    return (
        <div className="space-y-8 pb-20 text-[#1d2129]">
            <Workspace
                title="Employee Onboarding"
                newHref="/employee"
                newLabel=""
                summaryItems={[]}
                masterCards={[]}
                shortcuts={[]}
            />

            <div className="max-w-4xl mx-auto bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-[18px] font-bold text-[#1d2129] flex items-center gap-2">
                        <UserPlus size={20} className="text-blue-600" />
                        Role-Based Onboarding
                    </h3>
                    <Link to="/employee" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-[13px]">
                        <ArrowLeft size={16} /> Cancel
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Vacancy Selection (Optional but Recommended) */}
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[13px] font-bold text-blue-800 flex items-center gap-2">
                                <Briefcase size={16} /> Link to Vacancy (Job Opening)
                            </label>
                            <Link
                                to="/jobopening/new"
                                target="_blank"
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                                <span className="text-lg">+</span> Post New Vacancy
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={formData.vacancy}
                                onChange={handleVacancyChange}
                            >
                                <option value="">Select a Vacancy to Auto-fill</option>
                                {vacancies.map(v => (
                                    <option key={v._id} value={v._id}>
                                        {v.job_title} - {v.department} ({v.no_of_positions} positions)
                                    </option>
                                ))}
                            </select>
                            <div className="text-[11px] text-blue-600 flex items-center">
                                Selecting a vacancy will automatically fill the Department and Designation for the new employee.
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
                            <User size={16} /> Personal Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[13px] font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. John Doe"
                                    value={formData.employeeName}
                                    onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[13px] font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input
                                        required
                                        type="email"
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="john@company.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[13px] font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input
                                        required
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="johndoe"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[13px] font-medium text-gray-700">Login Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input
                                        required
                                        type="password"
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Min 6 characters"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[13px] font-medium text-gray-700">Joining Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.dateOfJoining}
                                        onChange={e => setFormData({ ...formData, dateOfJoining: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hierarchy & Role */}
                    <div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
                            <Building2 size={16} /> Hierarchy & Role
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[13px] font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.departmentId}
                                    onChange={handleDeptChange}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[13px] font-medium text-gray-700">Designation <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <select
                                        required
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.designation}
                                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                        disabled={!formData.departmentId}
                                    >
                                        <option value="">{formData.departmentId ? 'Select Designation' : 'Select Dept First'}</option>
                                        {filteredDesignations.map(d => (
                                            <option key={d._id} value={d.title}>{d.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[13px] font-medium text-gray-700">Reports To (Role/Designation)</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.reportsToRole}
                                    onChange={e => setFormData({ ...formData, reportsToRole: e.target.value })}
                                    disabled={!formData.departmentId}
                                >
                                    <option value="">{formData.departmentId ? 'Select Reporting Role' : 'Select Dept First'}</option>
                                    {filteredDesignations.map(d => (
                                        <option key={d._id} value={d.title}>{d.title}</option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Select the <strong>Designation</strong> that this employee reports to (e.g., Manager).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link to="/employee" className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-[13px] hover:bg-gray-50 transition-all">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-[13px] hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm"
                        >
                            {loading ? 'Onboarding...' : <><Save size={16} /> Complete Onboarding</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
