import React, { useEffect, useState } from 'react';
import { Truck, ShoppingBag, ArrowRight, DollarSign } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function SuppliersPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [suppliers, setSuppliers] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/supplier${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    active: data.length, // Placeholder logic
                });

                setSuppliers(data.slice(0, 10));

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
                title="Supplier Directory"
                newHref="/supplier/new"
                newLabel="Add Supplier"
                summaryItems={[
                    { label: 'Total Suppliers', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'supplier' },
                    { label: 'Active', value: loading ? '...' : counts.active || 0, color: 'text-emerald-500', doctype: 'supplier' },
                ]}
                masterCards={[
                    { label: 'All Suppliers', icon: Truck, count: counts.total || 0, href: '/supplier' },
                    { label: 'Purchase Orders', icon: ShoppingBag, count: 'View', href: '/purchase-order' },
                    { label: 'Invoices', icon: DollarSign, count: 'View', href: '/purchase-invoice' },
                ]}
                shortcuts={[
                    { label: 'Add New Supplier', href: '/supplier/new' },
                    { label: 'Supplier Groups', href: '/supplier-group' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Truck size={18} className="text-blue-600" />
                            Recent Suppliers
                        </h3>
                        <Link to="/supplier" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {suppliers.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No suppliers found.</div>
                        ) : (
                            suppliers.map((supp, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {supp.supplier_name ? supp.supplier_name.substring(0, 2).toUpperCase() : 'SU'}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{supp.supplier_name || 'Unnamed Supplier'}</p>
                                            <p className="text-[11px] text-gray-500">{supp.supplier_group || 'General'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Link to={`/supplier/${supp.name}`} className="text-[11px] font-bold text-blue-600 hover:underline">View Profile</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Supplier Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/supplier/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Add Supplier
                        </Link>
                        <Link to="/purchase-order/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Create PO
                        </Link>
                    </div>
                </div>
                <Truck className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
