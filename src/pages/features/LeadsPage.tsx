import React, { useEffect, useState } from 'react';
import { UserPlus, ArrowRight, Target, Filter, Phone, Mail } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function LeadsPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [leads, setLeads] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/lead${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    open: data.filter((l: any) => l.status === 'Open' || l.status === 'Lead').length,
                    qualified: data.filter((l: any) => l.status === 'Qualified').length,
                    converted: data.filter((l: any) => l.status === 'Converted').length,
                });

                setLeads(data.slice(0, 10));

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
                title="Lead Management"
                newHref="/lead/new"
                newLabel="Add Lead"
                summaryItems={[
                    { label: 'Total Leads', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'lead' },
                    { label: 'Open', value: loading ? '...' : counts.open || 0, color: 'text-orange-500', doctype: 'lead' },
                    { label: 'Qualified', value: loading ? '...' : counts.qualified || 0, color: 'text-emerald-500', doctype: 'lead' },
                ]}
                masterCards={[
                    { label: 'All Leads', icon: UserPlus, count: counts.total || 0, href: '/lead' },
                    { label: 'Pipeline', icon: Target, count: 'View', href: '/lead-pipeline' },
                    { label: 'Reports', icon: Filter, count: 'View', href: '/lead-reports' },
                ]}
                shortcuts={[
                    { label: 'Add New Lead', href: '/lead/new' },
                    { label: 'View Open Leads', href: '/lead?status=Open' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <UserPlus size={18} className="text-orange-600" />
                            Recent Leads
                        </h3>
                        <Link to="/lead" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {leads.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No leads found.</div>
                        ) : (
                            leads.map((lead, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded-full">
                                            <Target size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{lead.lead_name || lead.name || 'Unnamed Lead'}</p>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                {lead.email && <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>}
                                                {lead.mobile_no && <span className="flex items-center gap-1"><Phone size={10} /> {lead.mobile_no}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lead.status === 'Converted' ? 'bg-emerald-100 text-emerald-700' :
                                            lead.status === 'Qualified' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {lead.status || 'Open'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Lead Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/lead/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Capture Lead
                        </Link>
                        <Link to="/lead-pipeline" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            View Pipeline
                        </Link>
                    </div>
                </div>
                <Target className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
