import React, { useEffect, useState } from 'react';
import { Receipt, ArrowRight, DollarSign, CheckCircle, Clock } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function ExpensesPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [expenses, setExpenses] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/expenseclaim${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    approved: data.filter((e: any) => e.status === 'Approved').length,
                    pending: data.filter((e: any) => e.status === 'Pending' || e.status === 'Draft' || !e.status).length,
                });

                setExpenses(data.slice(0, 10));

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
                title="Expense Claims"
                newHref="/expenseclaim/new"
                newLabel="New Claim"
                summaryItems={[
                    { label: 'Total Claims', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'expenseclaim' },
                    { label: 'Pending Approval', value: loading ? '...' : counts.pending || 0, color: 'text-orange-500', doctype: 'expenseclaim' },
                    { label: 'Approved', value: loading ? '...' : counts.approved || 0, color: 'text-emerald-500', doctype: 'expenseclaim' },
                ]}
                masterCards={[
                    { label: 'All Expenses', icon: Receipt, count: counts.total || 0, href: '/expenseclaim' },
                    { label: 'Approvals', icon: CheckCircle, count: 'Manage', href: '/expense-approvals' },
                ]}
                shortcuts={[
                    { label: 'Create Expense Claim', href: '/expenseclaim/new' },
                    { label: 'My Claims', href: '/expenseclaim?my=true' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Receipt size={18} className="text-red-500" />
                            Recent Expenses
                        </h3>
                        <Link to="/expenseclaim" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {expenses.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No expense claims found.</div>
                        ) : (
                            expenses.map((exp, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-50 text-red-500 rounded">
                                            <Receipt size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{exp.employee_name || 'Employee'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{exp.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-red-600">${exp.total_claimed_amount || 0}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${exp.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {exp.status || 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Expense Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/expenseclaim/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Submit Claim
                        </Link>
                        <Link to="/expense-approvals" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Approve Claims
                        </Link>
                    </div>
                </div>
                <Receipt className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
