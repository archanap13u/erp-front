import React, { useEffect, useState } from 'react';
import { CreditCard, ArrowRight, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function PaymentsPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [payments, setPayments] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/paymententry${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    received: data.filter((p: any) => p.payment_type === 'Receive').length,
                    paid: data.filter((p: any) => p.payment_type === 'Pay').length,
                });

                setPayments(data.slice(0, 10));

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
                title="Payment Entries"
                newHref="/paymententry/new"
                newLabel="Record Payment"
                summaryItems={[
                    { label: 'Total Payments', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'paymententry' },
                    { label: 'Received', value: loading ? '...' : counts.received || 0, color: 'text-emerald-500', doctype: 'paymententry' },
                    { label: 'Paid Out', value: loading ? '...' : counts.paid || 0, color: 'text-orange-500', doctype: 'paymententry' },
                ]}
                masterCards={[
                    { label: 'All Payments', icon: CreditCard, count: counts.total || 0, href: '/paymententry' },
                    { label: 'Bank Reconciliation', icon: DollarSign, count: 'View', href: '/bank-reconciliation' },
                    { label: 'Payment Terms', icon: Calendar, count: 'Manage', href: '/payment-terms' },
                ]}
                shortcuts={[
                    { label: 'Record New Payment', href: '/paymententry/new' },
                    { label: 'View Received', href: '/paymententry?type=Receive' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <CreditCard size={18} className="text-emerald-600" />
                            Recent Payments
                        </h3>
                        <Link to="/paymententry" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {payments.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No payments recorded.</div>
                        ) : (
                            payments.map((pay, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded ${pay.payment_type === 'Receive' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                            <DollarSign size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{pay.party_name || 'Unknown Party'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{pay.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-[13px] font-bold ${pay.payment_type === 'Receive' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                            {pay.payment_type === 'Receive' ? '+' : '-'}${pay.paid_amount || 0}
                                        </p>
                                        <span className="text-[10px] text-gray-500">{pay.payment_type}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Payment Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/paymententry/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Record Payment
                        </Link>
                        <Link to="/bank-reconciliation" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Reconcile Bank
                        </Link>
                    </div>
                </div>
                <CreditCard className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
