import React, { useEffect, useState } from 'react';
import { Wrench, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function MaintenancePage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [schedules, setSchedules] = useState<any[]>([]);
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

                // 'Asset Maintenance' doctype
                const res = await fetch(`/api/resource/assetmaintenance${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    overdue: data.filter((m: any) => m.status === 'Overdue').length,
                });

                setSchedules(data.slice(0, 10));

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
                title="Maintenance Schedules"
                newHref="/assetmaintenance/new"
                newLabel="Schedule Maintenance"
                summaryItems={[
                    { label: 'Total Schedules', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'assetmaintenance' },
                    { label: 'Overdue', value: loading ? '...' : counts.overdue || 0, color: 'text-red-500', doctype: 'assetmaintenance' },
                ]}
                masterCards={[
                    { label: 'Schedules', icon: Calendar, count: counts.total || 0, href: '/assetmaintenance' },
                    { label: 'Logs', icon: Wrench, count: 'View', href: '/asset-maintenance-log' },
                ]}
                shortcuts={[
                    { label: 'New Schedule', href: '/assetmaintenance/new' },
                    { label: 'Maintenance Log', href: '/asset-maintenance-log' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Wrench size={18} className="text-orange-600" />
                            Upcoming Maintenance
                        </h3>
                        <Link to="/assetmaintenance" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {schedules.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No maintenance schedules found.</div>
                        ) : (
                            schedules.map((sch, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded">
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{sch.maintenance_team || 'Team'} - {sch.asset_name || 'Asset'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{sch.next_due_date || 'No Date'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Link to={`/assetmaintenance/${sch.name}`} className="text-[11px] font-bold text-blue-600 hover:underline">View</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Maintenance Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/assetmaintenance/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Schedule Maintenance
                        </Link>
                        <Link to="/asset-maintenance-log/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Log Maintenance
                        </Link>
                    </div>
                </div>
                <Wrench className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
