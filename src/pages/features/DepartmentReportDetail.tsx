import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Building2, UserCheck, Clock, ChevronDown, ChevronUp, Briefcase, FileText, Activity } from 'lucide-react';

export default function DepartmentReportDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [department, setDepartment] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [dailyReports, setDailyReports] = useState<any[]>([]);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
    const [filterEmployeeId, setFilterEmployeeId] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const orgId = localStorage.getItem('organization_id');

                // Fetch department details
                const deptRes = await fetch(`/api/resource/department/${id}?organizationId=${orgId}`);
                const deptJson = await deptRes.json();

                if (deptJson.data) {
                    setDepartment(deptJson.data);

                    // Fetch employees for this department
                    const empRes = await fetch(`/api/resource/employee?organizationId=${orgId}`);
                    const empJson = await empRes.json();

                    const allEmployees = empJson.data || [];
                    const deptEmployees = allEmployees.filter((e: any) => e.department === deptJson.data.name);
                    setEmployees(deptEmployees);

                    // Fetch other related data
                    const [projRes, repRes, attRes] = await Promise.all([
                        fetch(`/api/resource/project?organizationId=${orgId}`),
                        fetch(`/api/resource/dailyreport?organizationId=${orgId}`),
                        fetch(`/api/resource/attendance?organizationId=${orgId}`)
                    ]);

                    const [projJson, repJson, attJson] = await Promise.all([
                        projRes.json(),
                        repRes.json(),
                        attRes.json()
                    ]);

                    setProjects(projJson.data || []);
                    setDailyReports(repJson.data || []);
                    setAttendances(attJson.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch details", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const toggleExpand = (empId: string) => {
        setExpandedEmployee(expandedEmployee === empId ? null : empId);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading department details...</div>;
    }

    if (!department) {
        return <div className="p-8 text-center text-red-500">Department not found.</div>;
    }

    const activeCount = employees.filter(e => e.status === 'Active').length;
    const leaveCount = employees.filter(e => e.status === 'On Leave').length;

    return (
        <div className="space-y-8 pb-20 text-[#1d2129] animate-in slide-in-from-right-4">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {department.name} Report
                    </h1>
                    <p className="text-gray-500 text-sm">Detailed workforce analysis for {department.code}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">Total Staff</p>
                            <p className="text-2xl font-bold">{employees.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">Active</p>
                            <p className="text-2xl font-bold">{activeCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">On Leave</p>
                            <p className="text-2xl font-bold">{leaveCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#f0f4f7] bg-[#f9fafb]">
                    <h3 className="font-bold text-gray-800">Employee List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#f0f4f7] text-gray-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Designation</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date of Joining</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">No employees found in this department.</td>
                                </tr>
                            ) : (
                                employees.map((emp, idx) => {
                                    const isExpanded = expandedEmployee === emp._id;
                                    const empProjects = projects.filter(p => p.members?.includes(emp._id) && p.status === 'Active');
                                    const empReports = dailyReports.filter(r => r.employeeId === emp._id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

                                    // Get today's attendance
                                    const today = new Date().toISOString().split('T')[0];
                                    const todayAttendance = attendances.find(a => a.employeeId === emp.employeeId && a.date?.startsWith(today));


                                    return (
                                        <React.Fragment key={idx}>
                                            <tr className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-blue-50/30' : ''}`} onClick={() => toggleExpand(emp._id)}>
                                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                                    {isExpanded ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} className="text-gray-400" />}
                                                    {emp.employeeName}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{emp.designation}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                                        emp.status === 'On Leave' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {emp.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '-'}</td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-gray-50/50">
                                                    <td colSpan={4} className="px-6 py-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                                            {/* Working Status / Attendance */}
                                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3 border-b pb-2">
                                                                    <Activity size={16} className="text-emerald-500" /> Working Status
                                                                </h4>
                                                                {todayAttendance ? (
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-500">Check In:</span>
                                                                            <span className="font-mono font-bold text-gray-700">{todayAttendance.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString() : '-'}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-500">Status:</span>
                                                                            <span className="font-bold text-blue-600">{todayAttendance.status || 'Present'}</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-gray-400 italic">No attendance record for today yet.</p>
                                                                )}
                                                            </div>

                                                            {/* Active Projects */}
                                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3 border-b pb-2">
                                                                    <Briefcase size={16} className="text-blue-500" /> Active Projects
                                                                </h4>
                                                                {empProjects.length > 0 ? (
                                                                    <ul className="space-y-2">
                                                                        {empProjects.map((p, i) => (
                                                                            <li key={i} className="text-xs flex items-center justify-between">
                                                                                <span className="font-medium text-gray-700">{p.name}</span>
                                                                                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">{p.status}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <p className="text-xs text-gray-400 italic">No active projects assigned.</p>
                                                                )}
                                                            </div>

                                                            {/* Recent Daily Reports */}
                                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3 border-b pb-2">
                                                                    <FileText size={16} className="text-purple-500" /> Recent Daily Reports
                                                                </h4>
                                                                {empReports.length > 0 ? (
                                                                    <div className="space-y-3">
                                                                        {empReports.map((report, i) => (
                                                                            <div key={i} className="text-xs border-l-2 border-purple-200 pl-2">
                                                                                <p className="text-gray-500 text-[10px] mb-0.5">{new Date(report.date).toLocaleDateString()}</p>
                                                                                <ul className="list-disc list-inside text-gray-700">
                                                                                    {report.tasks?.slice(0, 2).map((t: any, ti: number) => (
                                                                                        <li key={ti} className="truncate">{t.description}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-gray-400 italic">No daily reports found.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Consolidated Department Work Log */}
            <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#f0f4f7] bg-[#f9fafb] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" /> Department Work Log
                        </h3>
                        <select
                            value={filterEmployeeId}
                            onChange={(e) => setFilterEmployeeId(e.target.value)}
                            className="bg-white border border-[#d1d8dd] text-[12px] rounded px-2 py-1 outline-none focus:border-blue-400"
                        >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                            ))}
                        </select>
                    </div>
                    <span className="text-xs text-gray-500">Showing recent activity</span>
                </div>
                <div className="p-0">
                    {dailyReports.filter(r => (filterEmployeeId ? r.employeeId === filterEmployeeId : employees.some(e => e._id === r.employeeId))).length === 0 ? (
                        <div className="p-8 text-center text-gray-400 italic">No work reports found.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {dailyReports
                                .filter(r => (filterEmployeeId ? r.employeeId === filterEmployeeId : employees.some(e => e._id === r.employeeId)))
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, filterEmployeeId ? 50 : 20) // Show more if filtered
                                .map((report, idx) => {
                                    const employee = employees.find(e => e._id === report.employeeId);
                                    return (
                                        <div key={idx} className="p-4 hover:bg-gray-50 flex gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                    {employee?.employeeName?.charAt(0) || '?'}
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold text-sm text-gray-900">{employee?.employeeName || 'Unknown Employee'}</h4>
                                                    <span className="text-xs text-gray-500">{new Date(report.date).toLocaleDateString()}</span>
                                                </div>
                                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                    {report.tasks?.map((t: any, i: number) => (
                                                        <li key={i}>
                                                            <span className={t.status === 'Completed' ? 'text-gray-700' : 'text-gray-500 italic'}>
                                                                {t.description}
                                                            </span>
                                                            {t.timeSpent && <span className="ml-2 text-xs text-gray-400">({t.timeSpent}h)</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {report.blockers && (
                                                    <p className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded max-w-fit">
                                                        <span className="font-bold">Blocker:</span> {report.blockers}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
