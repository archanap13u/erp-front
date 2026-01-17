import React, { useEffect, useState } from 'react';
import { Users, UserCheck, CalendarDays, Megaphone, TrendingUp, Plus, Clock, ArrowLeftRight, Building2, Vote, CheckCircle2, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Workspace from '../components/Workspace';
import CustomizationModal from '../components/CustomizationModal';
import DepartmentStaffManager from '../components/DepartmentStaffManager';

export default function HRDashboard() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [holidays, setHolidays] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [polls, setPolls] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [features, setFeatures] = useState<string[]>([]);
    const [employeeSearch, setEmployeeSearch] = useState('');

    const deptId = localStorage.getItem('department_id');
    const orgId = localStorage.getItem('organization_id');

    useEffect(() => {
        const storedFeatures = localStorage.getItem('user_features');
        if (storedFeatures) {
            try {
                setFeatures(JSON.parse(storedFeatures));
            } catch (e) {
                console.error(e);
            }
        }

        async function fetchData() {
            try {
                const orgId = localStorage.getItem('organization_id');
                const deptId = localStorage.getItem('department_id');
                const userRole = localStorage.getItem('user_role');

                // Step 1: Fetch Departments for context resolution (especially for Admin)
                const resDept = await fetch(`/api/resource/department?organizationId=${orgId}`);
                const jsonDept = await resDept.json();
                const fetchedDepts = jsonDept.data || [];
                setDepartments(fetchedDepts);

                // Fetch Department Features (Live Sync)
                if (deptId) {
                    fetch(`/api/resource/department/${deptId}?organizationId=${orgId}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.data && data.data.features) {
                                setFeatures(data.data.features);
                                localStorage.setItem('user_features', JSON.stringify(data.data.features));
                            }
                        })
                        .catch(err => console.error("Failed to sync features:", err));
                }

                let baseUrl = `/api/resource`;
                let globalParams = `?organizationId=${orgId || ''}`;
                let deptParams = globalParams;

                // Enforce strict isolation: If deptId exists, use it.
                // If not (Admin), try to find the HR department dynamically
                let contextDept = fetchedDepts.find((d: any) => d.panelType === 'HR');
                let effectiveDeptId = deptId || contextDept?._id;
                let effectiveDeptName = localStorage.getItem('department_name') || contextDept?.name;

                if (effectiveDeptId) {
                    deptParams += `&departmentId=${effectiveDeptId}`;
                }
                if (effectiveDeptName) {
                    deptParams += `&department=${encodeURIComponent(effectiveDeptName)}`;
                }

                const [resEmp, resAtt, resHol, resAnn] = await Promise.all([
                    fetch(`${baseUrl}/employee${globalParams}`),
                    fetch(`${baseUrl}/attendance${deptParams}`),
                    fetch(`${baseUrl}/holiday${deptParams}`),
                    fetch(`${baseUrl}/announcement${deptParams}`)
                ]);

                const [jsonEmp, jsonAtt, jsonHol, jsonAnn] = await Promise.all([
                    resEmp.json(),
                    resAtt.json(),
                    resHol.json(),
                    resAnn.json()
                ]);

                setEmployees(jsonEmp.data || []);
                setCounts({
                    employee: jsonEmp.data?.length || 0,
                    attendance: jsonAtt.data?.length || 0,
                    holiday: jsonHol.data?.length || 0,
                    announcement: jsonAnn.data?.length || 0
                });

                setHolidays(jsonHol.data?.slice(0, 3) || []);

                const allAnnouncements = jsonAnn.data || [];
                setAnnouncements(allAnnouncements.filter((a: any) => a.type !== 'Poll').slice(0, 3));
                setPolls(allAnnouncements.filter((a: any) => a.type === 'Poll').slice(0, 2));

                // We also need to update the creation links to use this context
                setContextData({ id: effectiveDeptId, name: effectiveDeptName });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [orgId, deptId]); // Re-run when org or dept context changes

    const [contextData, setContextData] = useState<{ id?: string, name?: string }>({});

    useEffect(() => {
        if (!orgId) return;
        fetch(`/api/resource/department?organizationId=${orgId}`)
            .then(res => res.json())
            .then(json => setDepartments(json.data || []))
            .catch(err => console.error(err));
    }, [orgId]);

    const handleSaveFeatures = async (newFeatures: string[]) => {
        try {
            const res = await fetch(`/api/resource/department/${deptId}?organizationId=${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: newFeatures })
            });

            if (res.ok) {
                localStorage.setItem('user_features', JSON.stringify(newFeatures));
                setFeatures(newFeatures);
                setIsCustomizing(false);
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleVote = async (pollId: string, optionLabel: string) => {
        const employeeId = localStorage.getItem('employee_id');
        if (!employeeId) {
            alert('You must be logged in as an employee to vote.');
            return;
        }

        try {
            const res = await fetch(`/api/poll/announcement/${pollId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, optionLabel })
            });

            if (res.ok) {
                const json = await res.json();
                // Update local state
                setPolls(prev => prev.map(p => p._id === pollId ? json.data : p));
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to submit vote');
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const res = await fetch(`/api/resource/announcement/${id}?organizationId=${orgId}`, { method: 'DELETE' });
            if (res.ok) {
                setAnnouncements(prev => prev.filter(a => a._id !== id));
            } else {
                alert('Failed to delete announcement');
            }
        } catch (e) {
            console.error(e);
            alert('Error deleting announcement');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <Workspace
                title="Human Resources Workspace"
                newHref={`/employee/new?departmentId=${contextData.id || ''}&department=${encodeURIComponent(contextData.name || '')}`}
                newLabel="Add Employee"
                onCustomize={() => setIsCustomizing(true)}
                summaryItems={[
                    { label: 'Active Staff', value: '', color: 'text-indigo-600', doctype: 'employee' },
                    { label: "Today's Presence", value: '', color: 'text-emerald-600', doctype: 'attendance' },
                    { label: 'Pending Reviews', value: '', color: 'text-orange-600', doctype: 'performancereview' },
                ]}
                masterCards={[
                    { label: 'Post Vacancy', icon: Building2, count: '', href: '/jobopening', feature: 'Post Vacancy' },
                    { label: 'Employee Transfer', icon: ArrowLeftRight, count: '', href: '/employee-transfer', feature: 'Employee Transfer' },
                    { label: 'Performance', icon: TrendingUp, count: '', href: '/performancereview' }, // Always show or add feature check if needed
                ].filter(card => !card.feature || features.includes(card.feature))}
                shortcuts={[
                    { label: 'Mark Attendance', href: '/attendance/new' },
                    { label: 'Post Announcement', href: `/announcement/new?department=${encodeURIComponent(contextData.name || '')}&departmentId=${contextData.id || ''}` },
                    { label: 'Add Holiday', href: '/holiday/new' },
                    { label: "My Panel's Staff", href: `/employee?departmentId=${contextData.id || ''}` },
                    { label: "All Employees", href: '/employee' },
                ]}
            />

            <CustomizationModal
                isOpen={isCustomizing}
                onClose={() => setIsCustomizing(false)}
                currentFeatures={features}
                onSave={handleSaveFeatures}
                title="HR Portal Customization"
            />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Announcements Section */}
                <div className="bg-white p-8 rounded-2xl border border-[#d1d8dd] shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[18px] font-bold text-[#1d2129] flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Megaphone size={20} />
                            </div>
                            Latest Announcements
                        </h3>
                        <div className="flex gap-2">
                            <Link to={`/announcement?department=${encodeURIComponent(contextData.name || '')}&departmentId=${contextData.id || ''}`} className="text-blue-600 text-[13px] font-medium hover:underline flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg">
                                View All <ArrowRight size={14} />
                            </Link>
                            <Link to={`/announcement/new?department=${encodeURIComponent(contextData.name || '')}&departmentId=${contextData.id || ''}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 no-underline">
                                <Plus size={14} /> New
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-6 flex-1">
                        {announcements.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Megaphone size={32} className="opacity-10 mb-2" />
                                <p className="italic text-[14px]">No recent announcements found.</p>
                            </div>
                        ) : (
                            announcements.map((ann, idx) => (
                                <div key={idx} className="group relative pl-6 border-l-2 border-blue-500 hover:border-blue-700 transition-all">
                                    <div className="absolute -left-1.5 top-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-[15px] font-bold text-[#1d2129] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{ann.title}</h4>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link to={`/announcement/${ann._id}`} className="text-gray-400 hover:text-blue-600">
                                                <Edit size={14} />
                                            </Link>
                                            <button onClick={() => handleDeleteAnnouncement(ann._id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-gray-500 mt-2 line-clamp-2 font-medium leading-relaxed">{ann.content}</p>
                                    <div className="flex items-center gap-2 mt-4">
                                        <Clock size={12} className="text-gray-400" />
                                        <p className="text-[11px] text-gray-400 uppercase font-black tracking-widest">
                                            {new Date(ann.date || ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Polls Section */}
                {polls.length > 0 && (
                    <div className="bg-white p-8 rounded-2xl border border-[#d1d8dd] shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[18px] font-bold text-[#1d2129] flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <Vote size={20} />
                                </div>
                                Active Polls
                            </h3>
                        </div>
                        <div className="space-y-8">
                            {polls.map((poll, idx) => {
                                const employeeId = localStorage.getItem('employee_id');
                                const totalVotes = poll.pollOptions.reduce((acc: number, curr: any) => acc + (curr.votes || 0), 0);
                                const hasVoted = poll.voters?.includes(employeeId);

                                return (
                                    <div key={idx} className="space-y-4">
                                        <div>
                                            <h4 className="text-[15px] font-bold text-[#1d2129]">{poll.title}</h4>
                                            <p className="text-[13px] text-gray-500 mt-1">{poll.content}</p>
                                        </div>
                                        <div className="space-y-3">
                                            {poll.pollOptions.map((opt: any, optIdx: number) => {
                                                const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                                return (
                                                    <div key={optIdx} className="space-y-1">
                                                        <div className="flex items-center justify-between text-[13px]">
                                                            <span className="font-medium text-gray-700">{opt.label}</span>
                                                            {hasVoted && <span className="font-bold text-gray-900">{percentage}%</span>}
                                                        </div>
                                                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden cursor-pointer" onClick={() => !hasVoted && handleVote(poll._id, opt.label)}>
                                                            {hasVoted && (
                                                                <div
                                                                    className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-1000"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            )}
                                                            {!hasVoted && (
                                                                <div className="absolute top-0 left-0 h-full w-full hover:bg-purple-100 transition-colors" />
                                                            )}
                                                        </div>
                                                        {!hasVoted && (
                                                            <button
                                                                onClick={() => handleVote(poll._id, opt.label)}
                                                                className="text-[11px] font-bold text-purple-600 hover:text-purple-800"
                                                            >
                                                                Vote for this option
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {hasVoted && (
                                                <div className="flex items-center gap-2 text-green-600 mt-2">
                                                    <CheckCircle2 size={14} />
                                                    <span className="text-[12px] font-bold uppercase tracking-wider">Voted</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Holidays Section */}
                <div className="bg-white p-8 rounded-2xl border border-[#d1d8dd] shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[18px] font-bold text-[#1d2129] flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                                <CalendarDays size={20} />
                            </div>
                            Upcoming Holidays
                        </h3>
                        <Link to="/holiday" className="text-blue-600 hover:text-blue-800 text-[13px] font-bold no-underline bg-blue-50 px-3 py-1.5 rounded-lg transition-all">View Calendar</Link>
                    </div>
                    <div className="space-y-4">
                        {holidays.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <CalendarDays size={32} className="opacity-10 mb-2" />
                                <p className="italic text-[14px]">No upcoming holidays listed.</p>
                            </div>
                        ) : (
                            holidays.map((hol, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-white hover:shadow-lg hover:border-orange-200 transition-all rounded-2xl border border-transparent">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100">
                                            <span className="text-[10px] font-black text-orange-500 uppercase">{new Date(hol.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                            <span className="text-[16px] font-black text-gray-900 leading-none">{new Date(hol.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-bold text-[#1d2129] uppercase tracking-tight">{hol.holidayName}</h4>
                                            <p className="text-[12px] text-gray-400 font-bold uppercase tracking-tighter">{hol.description || 'Public Holiday'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                                            {new Date(hol.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Inline Employee List View */}
            <div className="bg-white p-8 rounded-2xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h3 className="text-[18px] font-bold text-[#1d2129] flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                            <Users size={20} />
                        </div>
                        Employee Directory
                    </h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={employeeSearch}
                            onChange={(e) => setEmployeeSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-blue-400 w-full md:w-64"
                        />
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 uppercase tracking-tighter text-[11px] font-black text-gray-400 bg-gray-50/50">
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Designation</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {employees
                                .filter(emp =>
                                (emp.employeeName?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                                    emp.employeeId?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                                    emp.designation?.toLowerCase().includes(employeeSearch.toLowerCase()))
                                )
                                .slice(0, 10).map((emp, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-[10px]">
                                                    {emp.employeeName?.charAt(0)}
                                                </div>
                                                <span className="text-[13px] font-bold text-gray-700">{emp.employeeName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-gray-500 font-medium">{emp.employeeId}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100 uppercase">
                                                {emp.designation}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-gray-500">{emp.department}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Link to={`/employee/${emp._id}`} className="text-gray-400 hover:text-blue-600 transition-colors">
                                                <Edit size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                    {employees.length === 0 && (
                        <div className="py-12 text-center text-gray-400 italic text-[14px]">
                            No employees found in this view.
                        </div>
                    )}
                </div>
            </div>

            {/* Interactive Employee Management System */}
            <DepartmentStaffManager
                title="Staff & Hierarchy Management"
                description="Select a department to hire staff and see that department's designated roles."
            />
        </div >
    );
}
