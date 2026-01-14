import React, { useEffect, useState } from 'react';
import { Box, Wrench, MapPin, ArrowRight } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function AssetTrackingPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [assets, setAssets] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/asset${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    active: data.filter((a: any) => a.status === 'Submitted' || a.status === 'Partially Depreciated' || a.status === 'Fully Depreciated').length,
                    maintenance: data.filter((a: any) => a.maintenance_required).length,
                });

                setAssets(data.slice(0, 10));

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
                title="Asset Tracking"
                newHref="/asset/new"
                newLabel="New Asset"
                summaryItems={[
                    { label: 'Total Assets', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'asset' },
                    { label: 'Active', value: loading ? '...' : counts.active || 0, color: 'text-emerald-500', doctype: 'asset' },
                ]}
                masterCards={[
                    { label: 'All Assets', icon: Box, count: counts.total || 0, href: '/asset' },
                    { label: 'Movement', icon: MapPin, count: 'Track', href: '/asset-movement' },
                    { label: 'Maintenance', icon: Wrench, count: 'Manage', href: '/asset-maintenance' },
                ]}
                shortcuts={[
                    { label: 'Register Asset', href: '/asset/new' },
                    { label: 'Move Asset', href: '/asset-movement/new' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Box size={18} className="text-blue-600" />
                            Recent Assets
                        </h3>
                        <Link to="/asset" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {assets.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No assets found.</div>
                        ) : (
                            assets.map((asset, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <Box size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{asset.asset_name || 'Asset Name'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{asset.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${asset.status === 'Submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {asset.status || 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Asset Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/asset/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Register New Asset
                        </Link>
                        <Link to="/asset-movement/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Transfer Asset
                        </Link>
                    </div>
                </div>
                <Box className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
