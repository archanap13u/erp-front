import React, { useEffect, useState } from 'react';
import { FileText, ArrowRight, CheckCircle, Clock, XCircle, Users } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function QuotationsPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [quotations, setQuotations] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/quotation${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    open: data.filter((q: any) => q.status === 'Open').length,
                    ordered: data.filter((q: any) => q.status === 'Ordered').length,
                    lost: data.filter((q: any) => q.status === 'Lost').length,
                });

                setQuotations(data.slice(0, 10));

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
                title="Quotations & Estimates"
                newHref="/quotation/new"
                newLabel="New Quote"
                summaryItems={[
                    { label: 'Open Estimates', value: loading ? '...' : counts.open || 0, color: 'text-blue-500', doctype: 'quotation' },
                    { label: 'Converted', value: loading ? '...' : counts.ordered || 0, color: 'text-emerald-500', doctype: 'quotation' },
                    { label: 'Conversion Rate', value: loading ? '...' : `${counts.total > 0 ? Math.round((counts.ordered / counts.total) * 100) : 0}%`, color: 'text-purple-500', doctype: 'quotation' },
                ]}
                masterCards={[
                    { label: 'All Quotes', icon: FileText, count: counts.total || 0, href: '/quotation' },
                    { label: 'Customers', icon: Users, count: 'View', href: '/customer' },
                    { label: 'Open', icon: Clock, count: counts.open || 0, href: '/quotation?status=Open' },
                ]}
                shortcuts={[
                    { label: 'Create Quotation', href: '/quotation/new' },
                    { label: 'View Leads', href: '/lead' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-[12px] font-bold text-blue-600 uppercase">Open</p>
                            <p className="text-3xl font-bold text-blue-700 mt-1">{counts.open || 0}</p>
                        </div>
                        <Clock size={32} className="text-blue-300" />
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-[12px] font-bold text-emerald-600 uppercase">Converted</p>
                            <p className="text-3xl font-bold text-emerald-700 mt-1">{counts.ordered || 0}</p>
                        </div>
                        <CheckCircle size={32} className="text-emerald-300" />
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-[12px] font-bold text-gray-600 uppercase">Lost</p>
                            <p className="text-3xl font-bold text-gray-700 mt-1">{counts.lost || 0}</p>
                        </div>
                        <XCircle size={32} className="text-gray-300" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <FileText size={18} className="text-purple-600" />
                            Recent Quotations
                        </h3>
                        <Link to="/quotation" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {quotations.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No quotations found.</div>
                        ) : (
                            quotations.map((quote, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{quote.customer_name || quote.party_name || 'Customer'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{quote.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-[#1d2129]">{quote.grand_total ? `$${quote.grand_total}` : '-'}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${quote.status === 'Ordered' ? 'bg-emerald-100 text-emerald-700' :
                                            quote.status === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {quote.status || 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Quick Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/quotation/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Create Quotation
                        </Link>
                        <Link to="/lead" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            View Leads
                        </Link>
                    </div>
                </div>
                <FileText className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
