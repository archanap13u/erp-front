import React, { useEffect, useState } from 'react';
import { ShoppingCart, ShoppingBag, Truck, CheckCircle, ArrowRight, Package } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function SalesOrdersPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [orders, setOrders] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/salesorder${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    pending: data.filter((o: any) => o.status === 'Pending' || o.status === 'Draft' || !o.status).length,
                    completed: data.filter((o: any) => o.status === 'Completed').length,
                    delivered: data.filter((o: any) => o.delivery_status === 'Fully Delivered').length,
                });

                setOrders(data.slice(0, 10));

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
                title="Sales Orders"
                newHref="/salesorder/new"
                newLabel="New Order"
                summaryItems={[
                    { label: 'Total Orders', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'salesorder' },
                    { label: 'Pending', value: loading ? '...' : counts.pending || 0, color: 'text-orange-500', doctype: 'salesorder' },
                    { label: 'Completed', value: loading ? '...' : counts.completed || 0, color: 'text-emerald-500', doctype: 'salesorder' },
                ]}
                masterCards={[
                    { label: 'All Orders', icon: ShoppingCart, count: counts.total || 0, href: '/salesorder' },
                    { label: 'Deliveries', icon: Truck, count: 'Track', href: '/delivery-note' },
                    { label: 'Items', icon: Package, count: 'Manage', href: '/item' },
                ]}
                shortcuts={[
                    { label: 'Create Sales Order', href: '/salesorder/new' },
                    { label: 'View Pending', href: '/salesorder?status=Pending' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm p-6 flex items-center gap-4">
                        <div className="p-4 bg-orange-50 text-orange-600 rounded-full">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-gray-500 uppercase">Pending Fulfillment</p>
                            <p className="text-3xl font-bold text-[#1d2129]">{counts.pending || 0}</p>
                            <Link to="/salesorder?status=Pending" className="text-[12px] text-blue-600 hover:underline">View Queue</Link>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm p-6 flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
                            <Truck size={24} />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-gray-500 uppercase">Delivered This Month</p>
                            <p className="text-3xl font-bold text-[#1d2129]">{counts.delivered || 0}</p>
                            <p className="text-[11px] text-emerald-600 font-medium">On Track</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <ShoppingCart size={18} className="text-blue-600" />
                            Recent Orders
                        </h3>
                        <Link to="/salesorder" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {orders.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No sales orders found.</div>
                        ) : (
                            orders.map((order, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <ShoppingCart size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{order.customer_name || 'Customer'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{order.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-[#1d2129]">{order.grand_total ? `$${order.grand_total}` : '-'}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {order.status || 'Draft'}
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
                    <h4 className="text-[16px] font-bold mb-4">Order Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/salesorder/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            New Sales Order
                        </Link>
                        <Link to="/delivery-note/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Create Delivery Note
                        </Link>
                    </div>
                </div>
                <ShoppingCart className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
