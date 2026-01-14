import React, { useEffect, useState } from 'react';
import {
    BadgeDollarSign,
    DollarSign,
    Users,
    ArrowRight,
    TrendingUp,
    Calendar,
    FileText
} from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function PayrollPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const orgId = localStorage.getItem('organization_id');
                const deptId = localStorage.getItem('department_id');

                let queryParams = `?organizationId=${orgId || ''}`;
                if (deptId) {
                    queryParams += `&departmentId=${deptId}`;
                }

                const res = await fetch(`/api/resource/payroll${queryParams}`);
                const json = await res.json();

                const data = json.data || [];
                const currentMonth = new Date().getMonth();
                const thisMonth = data.filter((p: any) => new Date(p.posting_date || p.createdAt).getMonth() === currentMonth);

                setCounts({
                    total: data.length,
                    processed: thisMonth.filter((p: any) => p.status === 'Processed').length,
                    pending: thisMonth.filter((p: any) => p.status === 'Draft' || !p.status).length,
                });

                setPayrolls(data.slice(0, 10));

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="space-y-8 pb-20 text-[#1d2129]">
            <Workspace
                title="Payroll Management"
                newHref="/payroll/new"
                newLabel="Process Payroll"
                summaryItems={[
                    { label: 'This Month Processed', value: loading ? '...' : counts.processed || 0, color: 'text-emerald-500', doctype: 'payroll' },
                    { label: 'Pending Processing', value: loading ? '...' : counts.pending || 0, color: 'text-orange-500', doctype: 'payroll' },
                    { label: 'Total Payrolls', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'payroll' },
                ]}
                masterCards={[
                    { label: 'Process Payroll', icon: BadgeDollarSign, count: 'Monthly', href: '/payroll/new' },
                    { label: 'Salary Slips', icon: FileText, count: counts.total || 0, href: '/salary-slip' },
                    { label: 'Tax Deductions', icon: DollarSign, count: 'View', href: '/payroll/tax' },
                ]}
                shortcuts={[
                    { label: 'Process Monthly Payroll', href: '/payroll/new' },
                    { label: 'View Salary Slips', href: '/salary-slip' },
                    { label: 'Payroll Settings', href: '/payroll/settings' },
                ]}
            />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                    <h3 className="text-[16px] font-bold text-[#1d2129] mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-600" />
                        Monthly Overview
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">Processed</p>
                            <p className="text-2xl font-bold text-emerald-700 mt-1">{counts.processed || 0}</p>
                            <p className="text-[10px] text-emerald-500 mt-1">Payrolls this month</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wide">Pending</p>
                            <p className="text-2xl font-bold text-orange-700 mt-1">{counts.pending || 0}</p>
                            <p className="text-[10px] text-orange-500 mt-1">Awaiting processing</p>
                        </div>
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <FileText size={18} className="text-blue-600" />
                            Recent Payroll Entries
                        </h3>
                        <Link to="/payroll" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {payrolls.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic text-[13px]">No payroll entries found.</div>
                        ) : (
                            payrolls.map((payroll, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                                            <BadgeDollarSign size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{payroll.employee_name || 'Unknown Employee'}</p>
                                            <p className="text-[11px] text-gray-500">{payroll.month || 'N/A'} {payroll.year || ''}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-emerald-600">{payroll.net_pay ? `$${payroll.net_pay}` : '-'}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${payroll.status === 'Processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {payroll.status || 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Payroll Quick Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/payroll/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline flex items-center gap-2">
                            <BadgeDollarSign size={14} />
                            Process Monthly Payroll
                        </Link>
                        <Link to="/salary-slip" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline flex items-center gap-2">
                            <FileText size={14} />
                            View Salary Slips
                        </Link>
                        <Link to="/payroll/reports" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline flex items-center gap-2">
                            <TrendingUp size={14} />
                            Payroll Reports
                        </Link>
                    </div>
                </div>
                <DollarSign className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
