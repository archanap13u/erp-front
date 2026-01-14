import React, { useEffect, useState } from 'react';
import { Truck, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function DeliveryNotePage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [deliveries, setDeliveries] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/deliverynote${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    completed: data.filter((d: any) => d.status === 'Completed' || d.status === 'Closed').length,
                    pending: data.filter((d: any) => d.status === 'To Bill' || !d.status).length,
                });

                setDeliveries(data.slice(0, 10));

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
                title="Delivery Notes"
                newHref="/deliverynote/new"
                newLabel="New Delivery"
                summaryItems={[
                    { label: 'Total Deliveries', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'deliverynote' },
                    { label: 'Completed', value: loading ? '...' : counts.completed || 0, color: 'text-emerald-500', doctype: 'deliverynote' },
                    { label: 'To Bill', value: loading ? '...' : counts.pending || 0, color: 'text-orange-500', doctype: 'deliverynote' },
                ]}
                masterCards={[
                    { label: 'All Deliveries', icon: Truck, count: counts.total || 0, href: '/deliverynote' },
                    { label: 'Packing Slips', icon: CheckCircle, count: 'Manage', href: '/packing-slip' },
                ]}
                shortcuts={[
                    { label: 'Create Delivery Note', href: '/deliverynote/new' },
                    { label: 'View Pending Billing', href: '/deliverynote?status=To Bill' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Truck size={18} className="text-orange-600" />
                            Recent Shipments
                        </h3>
                        <Link to="/deliverynote" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {deliveries.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No delivery notes found.</div>
                        ) : (
                            deliveries.map((delivery, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded">
                                            <Truck size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{delivery.customer_name || 'Customer'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{delivery.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${delivery.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {delivery.status || 'To Bill'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Delivery Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/deliverynote/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            New Delivery
                        </Link>
                    </div>
                </div>
                <Truck className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
