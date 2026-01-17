
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Building2,
    Users,
    UserCheck,
    CalendarDays,
    Megaphone,
    School,
    FileCheck,
    GraduationCap,
    BookOpen,
    ArrowRight,
    Shield,
    Activity
} from 'lucide-react';
import Workspace from '../components/Workspace';

export default function DepartmentDetails() {
    const { id } = useParams();
    const [dept, setDept] = useState<any>(null);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function fetchData() {
            try {
                const orgId = localStorage.getItem('organization_id');
                // Fetch Dept Details
                const deptRes = await fetch(`/api/resource/department/${id}?organizationId=${orgId}`);
                const deptData = await deptRes.json();
                setDept(deptData.data);

                // Fetch Stats based on panel type
                let statUrl = `/api/resource`;
                let query = `?organizationId=${orgId}&departmentId=${id}`;

                // Common stats
                const [empRes, attRes] = await Promise.all([
                    fetch(`${statUrl}/employee${query}`),
                    fetch(`${statUrl}/attendance${query}`)
                ]);
                const employees = (await empRes.json()).data || [];
                const attendance = (await attRes.json()).data || [];

                let specificStats = {};

                if (deptData.data.panelType === 'Operations') {
                    const [uniRes, stuRes, appRes] = await Promise.all([
                        fetch(`${statUrl}/university${query}`),
                        fetch(`${statUrl}/student${query}`),
                        fetch(`${statUrl}/application${query}`)
                    ]);
                    specificStats = {
                        universities: (await uniRes.json()).data?.length || 0,
                        applications: (await stuRes.json()).data?.length || 0,
                        submissions: (await appRes.json()).data?.length || 0
                    };
                } else if (deptData.data.panelType === 'Finance') {
                    const [invRes, payRes, expRes] = await Promise.all([
                        fetch(`${statUrl}/salesinvoice${query}`),
                        fetch(`${statUrl}/paymententry${query}`),
                        fetch(`${statUrl}/expenseclaim${query}`)
                    ]);
                    specificStats = {
                        invoices: (await invRes.json()).data?.length || 0,
                        payments: (await payRes.json()).data?.length || 0,
                        expenses: (await expRes.json()).data?.length || 0
                    };
                }

                setStats({
                    employees: employees.length,
                    attendance: attendance.length,
                    ...specificStats
                });

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center italic text-gray-400">Loading department details...</div>;
    if (!dept) return <div className="p-8 text-center text-red-500">Department not found.</div>;

    const hasFeature = (f: string) => dept.features?.includes(f);

    const isHR = hasFeature('Attendance') || hasFeature('Payroll') || hasFeature('Recruitment');
    const isOps = hasFeature('University') || hasFeature('Study Center');
    const isFinance = hasFeature('Invoices') || hasFeature('Payments') || hasFeature('Expenses');

    const summaryItems = [
        { label: 'Assigned Staff', value: stats.employees || 0, color: 'text-blue-500', doctype: 'employee' },
    ];

    if (hasFeature('Attendance')) {
        summaryItems.push({ label: 'Today Present', value: stats.attendance || 0, color: 'text-emerald-500', doctype: 'attendance' });
    }
    if (hasFeature('University')) {
        summaryItems.push({ label: 'Universities', value: stats.universities || 0, color: 'text-orange-500', doctype: 'university' });
    }
    if (hasFeature('STUDENTS')) { // Renamed from 'APPLICATIONS'
        summaryItems.push({ label: 'Total STUDENTS', value: stats.students || 0, color: 'text-purple-500', doctype: 'student' });
    }
    if (hasFeature('Invoices')) {
        summaryItems.push({ label: 'Invoices', value: stats.invoices || 0, color: 'text-orange-500', doctype: 'salesinvoice' });
    }
    if (hasFeature('Payments')) {
        summaryItems.push({ label: 'Payments', value: stats.payments || 0, color: 'text-emerald-500', doctype: 'paymententry' });
    }

    return (
        <div className="space-y-8 pb-20 text-[#1d2129]">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-[20px] font-bold text-[#1d2129] flex items-center gap-2">
                        <Building2 className="text-blue-600" size={24} />
                        {dept.name} <span className="text-gray-400 font-normal">Details</span>
                    </h2>
                    <p className="text-[13px] text-gray-500 max-w-2xl mt-1">
                        {dept.description || 'No description provided.'}
                    </p>
                    <div className="flex gap-2 mt-2">
                        {dept.features?.map((f: string) => (
                            <span key={f} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold border border-blue-100">{f}</span>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        to={`/department-login?deptId=${dept._id}`}
                        className="bg-white border border-[#d1d8dd] text-[#1d2129] px-4 py-2 rounded font-bold text-[13px] hover:bg-gray-50 flex items-center gap-2 no-underline"
                    >
                        <Shield size={14} /> Login as Admin
                    </Link>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-[13px] hover:bg-blue-700">
                        Edit Settings
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {summaryItems.map((item, i) => (
                    <div key={i} className="frappe-card p-4 bg-white flex flex-col gap-1">
                        <span className={`text-[24px] font-bold ${item.color}`}>{item.value}</span>
                        <span className="text-[13px] text-gray-500">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Operations Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="frappe-card p-6 bg-white">
                    <h3 className="text-[16px] font-bold text-[#1d2129] mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-blue-600" />
                        Operational Scope
                    </h3>
                    <div className="space-y-4">
                        <p className="text-[13px] text-gray-600 leading-relaxed">
                            This department is configured as a <strong>{dept.panelType}</strong> unit.
                            {isHR && " It handles employee records, attendance tracking, payroll, and recruitment notifications."}
                            {isOps && " It manages university partnerships, application enrollments, and record processing."}
                            {isFinance && " It tracks invoices, payments, expense claims, and financial reporting."}
                            {!isHR && !isOps && !isFinance && " It has standard access to general resources."}
                        </p>

                        <div className="p-4 bg-gray-50 rounded border border-gray-200">
                            <h4 className="text-[12px] font-bold text-gray-700 mb-2 uppercase">Credentials</h4>
                            <div className="grid grid-cols-2 gap-4 text-[13px]">
                                <div>
                                    <span className="text-gray-500">Username:</span>
                                    <p className="font-mono font-bold">{dept.username || 'Not set'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Password:</span>
                                    <p className="font-mono font-bold">{dept.password || 'Not set'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="frappe-card p-6 bg-white">
                    <h3 className="text-[16px] font-bold text-[#1d2129] mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-emerald-600" />
                        Access Control
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-3">
                                <Users size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-[13px] font-bold">Assigned Employees</p>
                                    <p className="text-[11px] text-gray-500">Staff with access to this department</p>
                                </div>
                            </div>
                            <span className="text-[13px] font-bold text-gray-700">{stats.employees}</span>
                        </div>
                        {/* More list items if needed */}
                    </div>
                </div>
            </div>
        </div >
    );
}
