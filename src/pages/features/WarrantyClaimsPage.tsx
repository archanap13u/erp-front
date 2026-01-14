import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowRight, FileText, CheckCircle } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function WarrantyClaimsPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [claims, setClaims] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/warrantyclaim${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    open: data.filter((w: any) => w.status === 'Open').length,
                    resolved: data.filter((w: any) => w.status === 'Closed' || w.status === 'Resolved').length,
                });

                setClaims(data.slice(0, 10));

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
                title="Warranty Claims"
                newHref="/warrantyclaim/new"
                newLabel="New Claim"
                summaryItems={[
                    { label: 'Total Claims', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'warrantyclaim' },
                    { label: 'Open', value: loading ? '...' : counts.open || 0, color: 'text-orange-500', doctype: 'warrantyclaim' },
                    { label: 'Resolved', value: loading ? '...' : counts.resolved || 0, color: 'text-emerald-500', doctype: 'warrantyclaim' },
                ]}
                masterCards={[
                    { label: 'All Claims', icon: ShieldCheck, count: counts.total || 0, href: '/warrantyclaim' },
                    { label: 'Serial Numbers', icon: FileText, count: 'View', href: '/serial-no' },
                ]}
                shortcuts={[
                    { label: 'File Claim', href: '/warrantyclaim/new' },
                    { label: 'Check Status', href: '/warrantyclaim?status=Open' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <ShieldCheck size={18} className="text-blue-600" />
                            Recent Claims
                        </h3>
                        <Link to="/warrantyclaim" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {claims.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No warranty claims found.</div>
                        ) : (
                            claims.map((claim, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{claim.customer_name || 'Customer'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{claim.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${claim.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {claim.status || 'Open'}
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
                    <h4 className="text-[16px] font-bold mb-4">Claim Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/warrantyclaim/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            File New Claim
                        </Link>
                    </div>
                </div>
                <ShieldCheck className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
