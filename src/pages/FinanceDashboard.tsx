
import React, { useEffect, useState } from 'react';
import {
    BadgeDollarSign,
    FileText,
    CreditCard,
    TrendingUp,
    Wallet,
    Receipt,
    ArrowRight,
    Search,
    BookOpen,
    Users,
    GraduationCap,
    Eye
} from 'lucide-react';
import Workspace from '../components/Workspace';
import { Link } from 'react-router-dom';
import DepartmentStaffManager from '../components/DepartmentStaffManager';

export default function FinanceDashboard() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [invoices, setInvoices] = useState<any[]>([]);
    const [pendingStudents, setPendingStudents] = useState<any[]>([]);
    const [pendingEmployees, setPendingEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const orgId = localStorage.getItem('organization_id');
    const deptId = localStorage.getItem('department_id');

    useEffect(() => {
        async function fetchData() {
            try {
                const userRole = localStorage.getItem('user_role');

                let baseUrl = `/api/resource`;
                let queryParams = `?organizationId=${orgId || ''}`;

                if (deptId) {
                    queryParams += `&departmentId=${deptId}`;
                }

                const [resInv, resPay, resExp, resLead] = await Promise.all([
                    fetch(`${baseUrl}/salesinvoice${queryParams}`),
                    fetch(`${baseUrl}/paymententry${queryParams}`),
                    fetch(`${baseUrl}/expenseclaim${queryParams}`),
                    fetch(`${baseUrl}/lead${queryParams}`)
                ]);

                const [jsonInv, jsonPay, jsonExp, jsonLead] = await Promise.all([
                    resInv.json(), resPay.json(), resExp.json(), resLead.json()
                ]);

                setCounts({
                    invoice: jsonInv.data?.length || 0,
                    payment: jsonPay.data?.length || 0,
                    expense: jsonExp.data?.length || 0,
                    lead: jsonLead.data?.length || 0
                });

                setInvoices((jsonInv.data || []).slice(0, 5)); // Recent 5

                // Fetch Students Verified by Ops
                const resStd = await fetch(`${baseUrl}/student${queryParams}&verificationStatus=Verified by Ops`);
                const jsonStd = await resStd.json();
                setPendingStudents(jsonStd.data || []);

                // Fetch Pending Employees
                const resEmp = await fetch(`${baseUrl}/employee${queryParams}&verificationStatus=Pending`);
                const jsonEmp = await resEmp.json();
                setPendingEmployees(jsonEmp.data || []);

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const [departments, setDepartments] = useState<any[]>([]);
    const [contextData, setContextData] = useState<{ id?: string, name?: string }>({});

    useEffect(() => {
        if (!orgId) return;
        fetch(`/api/resource/department?organizationId=${orgId}`)
            .then(res => res.json())
            .then(json => {
                const depts = json.data || [];
                setDepartments(depts);
                const finDept = depts.find((d: any) => d.panelType === 'Finance');
                if (finDept) setContextData({ id: finDept._id, name: finDept.name });
            })
            .catch(err => console.error(err));
    }, [orgId]);

    return (
        <div className="space-y-8 pb-20 text-[#1d2129]">
            <Workspace
                title="Finance Workspace"
                newHref={`/salesinvoice/new?department=${encodeURIComponent(contextData.name || '')}&departmentId=${contextData.id || ''}`}
                summaryItems={[
                    { label: 'Total STUDENTS', value: '', color: 'text-blue-500', doctype: 'student' },
                    { label: 'Received Payments', value: '', color: 'text-emerald-500', doctype: 'paymententry' },
                    { label: 'Expense Claims', value: '', color: 'text-red-500', doctype: 'expenseclaim' },
                ]}
                masterCards={[
                    { label: 'STUDENT Fees', icon: GraduationCap, count: '', href: '/finance-students' },
                    { label: 'Payments', icon: CreditCard, count: '', href: '/paymententry' },
                    { label: 'Expenses', icon: Receipt, count: '', href: '/expenseclaim' },
                    { label: 'General Ledger', icon: BookOpen, count: '', href: '#' },
                ]}
                shortcuts={[
                    { label: 'Create Invoice', href: `/salesinvoice/new?department=${encodeURIComponent(contextData.name || '')}&departmentId=${contextData.id || ''}` },
                    { label: 'Record Payment', href: `/paymententry/new?department=${encodeURIComponent(contextData.name || '')}&departmentId=${contextData.id || ''}` },
                    { label: 'New Expense Claim', href: `/expenseclaim/new?department=${encodeURIComponent(contextData.name || '')}&departmentId=${contextData.id || ''}` },
                    { label: 'Post Announcement', href: `/announcement/new?department=${encodeURIComponent(contextData.name || '')}&departmentId=${contextData.id || ''}` },
                ]}
            />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Invoices */}
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <FileText size={18} className="text-blue-600" />
                            Recent Invoices
                        </h3>
                        <Link to="/salesinvoice" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {invoices.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic text-[13px]">No recent invoices found.</div>
                        ) : (
                            invoices.map((inv, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <Receipt size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{inv.customer || 'Unknown Customer'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{inv.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-emerald-600">{inv.grand_total ? `$${inv.grand_total}` : '-'}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                            inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {inv.status || 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pending Financial Approvals (New Section) */}
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-indigo-50/30 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <CreditCard size={18} className="text-indigo-600" />
                            Pending Financial Approvals
                        </h3>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {pendingStudents.length} STUDENTS
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {pendingStudents.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic text-[13px]">No records awaiting financial approval.</div>
                        ) : (
                            pendingStudents.map((student, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{student.studentName}</p>
                                            <p className="text-[11px] text-gray-500 font-medium">{student.studyCenter}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Link to={`/student/${student._id}`} className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100" title="View Details">
                                            <Eye size={14} />
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Approve student financial record?')) return;
                                                try {
                                                    const res = await fetch(`/api/resource/student/${student._id}?organizationId=${orgId}`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ verificationStatus: 'Active' })
                                                    });
                                                    if (res.ok) window.location.reload();
                                                } catch (e) { console.error(e); }
                                            }}
                                            className="bg-emerald-600 text-white px-3 py-1 rounded text-[11px] font-bold hover:bg-emerald-700 shadow-sm"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pending Employee Verifications (New Section) */}
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-amber-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Users size={18} className="text-amber-600" />
                            Pending Employee Verifications
                        </h3>
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {pendingEmployees.length} PENDING
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                        {pendingEmployees.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic text-[13px]">No employees awaiting verification.</div>
                        ) : (
                            pendingEmployees.map((emp, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 text-amber-600 rounded">
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{emp.employeeName} ({emp.employeeId})</p>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                                                <span>{emp.department || 'No Dept'}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span>{emp.designation || 'No Role'}</span>
                                                {emp.studyCenter && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                        <span>{emp.studyCenter}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={async () => {
                                                if (!confirm(`Verify employee ${emp.employeeName}?`)) return;
                                                try {
                                                    const res = await fetch(`/api/resource/employee/${emp._id}?organizationId=${orgId}`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ verificationStatus: 'Verified' })
                                                    });
                                                    if (res.ok) window.location.reload();
                                                } catch (e) { console.error(e); }
                                            }}
                                            className="bg-amber-600 text-white px-3 py-1 rounded text-[11px] font-bold hover:bg-amber-700 shadow-sm"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Financial Overview */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                        <h3 className="text-[16px] font-bold text-[#1d2129] mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-emerald-600" />
                            Cash Flow Overview
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">Inflow</p>
                                <p className="text-2xl font-bold text-emerald-700 mt-1">$12,450</p>
                                <p className="text-[10px] text-emerald-500 flex items-center gap-1 mt-1">
                                    <TrendingUp size={10} /> +12% this month
                                </p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide">Outflow</p>
                                <p className="text-2xl font-bold text-red-700 mt-1">$4,320</p>
                                <p className="text-[10px] text-red-500 mt-1">
                                    Software & Utilities
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-[16px] font-bold mb-2">Quick Actions</h4>
                            <div className="flex flex-wrap gap-2">
                                <Link to="/salesinvoice/new" className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-[12px] font-medium backdrop-blur-sm transition-colors no-underline">
                                    + New Invoice
                                </Link>
                                <Link to="/paymententry/new" className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-[12px] font-medium backdrop-blur-sm transition-colors no-underline">
                                    + Receive Payment
                                </Link>
                                <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-[12px] font-medium backdrop-blur-sm transition-colors">
                                    Generate Report
                                </button>
                            </div>
                        </div>
                        <Wallet className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-2">
                    <DepartmentStaffManager
                        departmentId={localStorage.getItem('department_id') || undefined}
                        title="Finance Team Access"
                        description="Manage credentials for finance department staff."
                    />
                </div>
            </div>
        </div>
    );
}

// Needed: Ensure Lucide icons imported above are correct.
// Added: BookOpen for General Ledger placeholder.
