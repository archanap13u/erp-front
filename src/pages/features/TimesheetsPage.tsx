import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Briefcase, DollarSign, ArrowRight } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function TimesheetsPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [timesheets, setTimesheets] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/timesheet${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    billed: data.filter((t: any) => t.status === 'Billed').length,
                    open: data.filter((t: any) => t.status === 'Draft' || t.status === 'Submitted').length,
                });

                setTimesheets(data.slice(0, 10));

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
                title="Timesheets"
                newHref="/timesheet/new"
                newLabel="Log Time"
                summaryItems={[
                    { label: 'Total Logs', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'timesheet' },
                    { label: 'Open', value: loading ? '...' : counts.open || 0, color: 'text-orange-500', doctype: 'timesheet' },
                    { label: 'Billed', value: loading ? '...' : counts.billed || 0, color: 'text-emerald-500', doctype: 'timesheet' },
                ]}
                masterCards={[
                    { label: 'All Timesheets', icon: Clock, count: counts.total || 0, href: '/timesheet' },
                    { label: 'Projects', icon: Briefcase, count: 'View', href: '/project' },
                ]}
                shortcuts={[
                    { label: 'Log New Time', href: '/timesheet/new' },
                    { label: 'View My Timesheets', href: '/timesheet?my_timesheets=true' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Clock size={18} className="text-purple-600" />
                            Recent Time Logs
                        </h3>
                        <Link to="/timesheet" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {timesheets.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No timesheets found.</div>
                        ) : (
                            timesheets.map((sheet, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{sheet.employee_name || 'Employee'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{sheet.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-[#1d2129]">{sheet.total_hours ? `${sheet.total_hours} hrs` : '-'}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sheet.status === 'Billed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {sheet.status || 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Time Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/timesheet/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Log Time
                        </Link>
                    </div>
                </div>
                <Clock className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
