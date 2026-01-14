import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, Handshake, DollarSign, ArrowRight, Filter } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function DealsPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [deals, setDeals] = useState<any[]>([]);
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

                // Opportunity doctype usually maps to "Deals"
                const res = await fetch(`/api/resource/opportunity${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    open: data.filter((d: any) => d.status === 'Open').length,
                    won: data.filter((d: any) => d.status === 'Converted').length,
                    lost: data.filter((d: any) => d.status === 'Lost').length,
                });

                setDeals(data.slice(0, 10));

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
                title="Deals & Opportunities"
                newHref="/opportunity/new"
                newLabel="Add Deal"
                summaryItems={[
                    { label: 'Total Pipeline', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'opportunity' },
                    { label: 'Open Deals', value: loading ? '...' : counts.open || 0, color: 'text-orange-500', doctype: 'opportunity' },
                    { label: 'Won', value: loading ? '...' : counts.won || 0, color: 'text-emerald-500', doctype: 'opportunity' },
                ]}
                masterCards={[
                    { label: 'All Deals', icon: Handshake, count: counts.total || 0, href: '/opportunity' },
                    { label: 'Pipeline View', icon: TrendingUp, count: 'Manage', href: '/deal-pipeline' },
                    { label: 'Forecast', icon: Target, count: 'View', href: '/deal-forecast' },
                ]}
                shortcuts={[
                    { label: 'Add New Deal', href: '/opportunity/new' },
                    { label: 'View Pipeline', href: '/deal-pipeline' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Target size={20} /></div>
                            <h4 className="font-bold text-[#1d2129]">Pipeline</h4>
                        </div>
                        <p className="text-2xl font-bold text-[#1d2129] mb-1">{counts.open || 0}</p>
                        <p className="text-[11px] text-gray-500">Active Opportunities</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20} /></div>
                            <h4 className="font-bold text-[#1d2129]">Won</h4>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700 mb-1">{counts.won || 0}</p>
                        <p className="text-[11px] text-gray-500">Closed Won</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={20} /></div>
                            <h4 className="font-bold text-[#1d2129]">Conv. Rate</h4>
                        </div>
                        <p className="text-2xl font-bold text-purple-700 mb-1">{counts.total > 0 ? Math.round((counts.won / counts.total) * 100) : 0}%</p>
                        <p className="text-[11px] text-gray-500">Win Rate</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Handshake size={18} className="text-emerald-600" />
                            Recent Deals
                        </h3>
                        <Link to="/opportunity" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {deals.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No deals found.</div>
                        ) : (
                            deals.map((deal, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <Handshake size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{deal.customer_name || deal.party_name || 'Prospect'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{deal.title || deal.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-[#1d2129]">{deal.opportunity_amount ? `$${deal.opportunity_amount}` : '-'}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${deal.status === 'Converted' ? 'bg-emerald-100 text-emerald-700' :
                                            deal.status === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {deal.status || 'Open'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Deal Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/opportunity/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Create Deal
                        </Link>
                        <Link to="/deal-pipeline" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Manage Pipeline
                        </Link>
                    </div>
                </div>
                <Handshake className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
