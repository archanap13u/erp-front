import React, { useEffect, useState } from 'react';
import { FileText, Receipt, ArrowRight, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function InvoicesPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [invoices, setInvoices] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/salesinvoice${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    paid: data.filter((i: any) => i.status === 'Paid').length,
                    overdue: data.filter((i: any) => i.status === 'Overdue').length,
                    draft: data.filter((i: any) => i.status === 'Draft' || !i.status).length,
                });

                setInvoices(data.slice(0, 10));

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
                title="Invoice Management"
                newHref="/salesinvoice/new"
                newLabel="Create Invoice"
                summaryItems={[
                    { label: 'Total Invoices', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'salesinvoice' },
                    { label: 'Paid', value: loading ? '...' : counts.paid || 0, color: 'text-emerald-500', doctype: 'salesinvoice' },
                    { label: 'Overdue', value: loading ? '...' : counts.overdue || 0, color: 'text-red-500', doctype: 'salesinvoice' },
                ]}
                masterCards={[
                    { label: 'All Invoices', icon: FileText, count: '', href: '/salesinvoice' },
                    { label: 'Recurring', icon: Receipt, count: '', href: '/recurring-invoice' },
                    { label: 'Reports', icon: TrendingUp, count: '', href: '/invoice-reports' },
                ]}
                shortcuts={[
                    { label: 'Create New Invoice', href: '/salesinvoice/new' },
                    { label: 'View Overdue', href: '/salesinvoice?status=Overdue' },
                    { label: 'Payment Terms', href: '/payment-terms' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-[12px] font-bold text-emerald-600 uppercase">Paid this Month</p>
                            <p className="text-3xl font-bold text-emerald-700 mt-1">{counts.paid || 0}</p>
                        </div>
                        <CheckCircle size={32} className="text-emerald-300" />
                    </div>
                    <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-center justify-between">
                        <div>
                            <p className="text-[12px] font-bold text-red-600 uppercase">Overdue</p>
                            <p className="text-3xl font-bold text-red-700 mt-1">{counts.overdue || 0}</p>
                        </div>
                        <AlertCircle size={32} className="text-red-300" />
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-[12px] font-bold text-blue-600 uppercase">Drafts</p>
                            <p className="text-3xl font-bold text-blue-700 mt-1">{counts.draft || 0}</p>
                        </div>
                        <FileText size={32} className="text-blue-300" />
                    </div>
                </div>

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
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No invoices found.</div>
                        ) : (
                            invoices.map((inv, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <Receipt size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{inv.customer_name || inv.customer || 'Unknown Customer'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{inv.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-[#1d2129]">{inv.grand_total ? `$${inv.grand_total}` : '-'}</p>
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
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Invoice Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/salesinvoice/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Create Invoice
                        </Link>
                        <Link to="/salesinvoice" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            All Invoices
                        </Link>
                    </div>
                </div>
                <Receipt className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
