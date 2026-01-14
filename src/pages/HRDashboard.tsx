import React, { useEffect, useState } from 'react';
import { Users, UserCheck, CalendarDays, Megaphone, TrendingUp, Plus, Clock, ArrowLeftRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Workspace from '../components/Workspace';
import CustomizationModal from '../components/CustomizationModal';

export default function HRDashboard() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [holidays, setHolidays] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [features, setFeatures] = useState<string[]>([]);

    const deptId = localStorage.getItem('department_id');
    const orgId = localStorage.getItem('organization_id');

    useEffect(() => {
        const storedFeatures = localStorage.getItem('user_features');
        if (storedFeatures) {
            try {
                setFeatures(JSON.parse(storedFeatures));
            } catch (e) {
                console.error(e);
            }
        }

        async function fetchData() {
            try {
                const orgId = localStorage.getItem('organization_id');
                const deptId = localStorage.getItem('department_id');
                const userRole = localStorage.getItem('user_role');

                // Fetch Department Features (Live Sync)
                if (deptId) {
                    fetch(`/api/resource/department/${deptId}?organizationId=${orgId}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.data && data.data.features) {
                                setFeatures(data.data.features);
                                localStorage.setItem('user_features', JSON.stringify(data.data.features));
                            }
                        })
                        .catch(err => console.error("Failed to sync features:", err));
                }

                let baseUrl = `/api/resource`;
                let queryParams = `?organizationId=${orgId || ''}`;

                if (deptId && userRole !== 'SuperAdmin' && userRole !== 'OrganizationAdmin') {
                    queryParams += `&departmentId=${deptId}`;
                }

                const [resEmp, resAtt, resHol, resAnn] = await Promise.all([
                    fetch(`${baseUrl}/employee${queryParams}`),
                    fetch(`${baseUrl}/attendance${queryParams}`),
                    fetch(`${baseUrl}/holiday${queryParams}`),
                    fetch(`${baseUrl}/announcement${queryParams}`)
                ]);

                const [jsonEmp, jsonAtt, jsonHol, jsonAnn] = await Promise.all([
                    resEmp.json(),
                    resAtt.json(),
                    resHol.json(),
                    resAnn.json()
                ]);

                setCounts({
                    employee: jsonEmp.data?.length || 0,
                    attendance: jsonAtt.data?.length || 0,
                    holiday: jsonHol.data?.length || 0,
                    announcement: jsonAnn.data?.length || 0
                });

                setHolidays(jsonHol.data?.slice(0, 3) || []);
                setAnnouncements(jsonAnn.data?.slice(0, 3) || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSaveFeatures = async (newFeatures: string[]) => {
        try {
            const res = await fetch(`/api/resource/department/${deptId}?organizationId=${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: newFeatures })
            });

            if (res.ok) {
                localStorage.setItem('user_features', JSON.stringify(newFeatures));
                setFeatures(newFeatures);
                setIsCustomizing(false);
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <Workspace
                title="Human Resources Workspace"
                newHref="/employee/new"
                newLabel="Add Employee"
                onCustomize={() => setIsCustomizing(true)}
                summaryItems={[
                    { label: 'Active Staff', value: loading ? '...' : counts.employee || 0, color: 'text-indigo-600', doctype: 'employee' },
                    { label: "Today's Presence", value: loading ? '...' : counts.attendance || 0, color: 'text-emerald-600', doctype: 'attendance' },
                    { label: 'Pending Reviews', value: '2', color: 'text-orange-600', doctype: 'performancereview' },
                ]}
                masterCards={[
                    { label: 'Add Employee', icon: Plus, count: '', href: '/employee/new', feature: 'Add Employee' },
                    { label: 'Post Vacancy', icon: Building2, count: '', href: '/jobopening/new', feature: 'Post Vacancy' },
                    { label: 'Employee Transfer', icon: ArrowLeftRight, count: '', href: '/employee-transfer', feature: 'Employee Transfer' },
                    { label: 'Performance', icon: TrendingUp, count: '', href: '/performancereview' }, // Always show or add feature check if needed
                ].filter(card => !card.feature || features.includes(card.feature))}
                shortcuts={[
                    { label: 'Mark Attendance', href: '/attendance/new' },
                    { label: 'Post Announcement', href: '/announcement/new' },
                    { label: 'Add Holiday', href: '/holiday/new' },
                ]}
            />

            <CustomizationModal
                isOpen={isCustomizing}
                onClose={() => setIsCustomizing(false)}
                currentFeatures={features}
                onSave={handleSaveFeatures}
                title="HR Portal Customization"
            />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Announcements Section */}
                <div className="bg-white p-8 rounded-2xl border border-[#d1d8dd] shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[18px] font-bold text-[#1d2129] flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Megaphone size={20} />
                            </div>
                            Latest Announcements
                        </h3>
                        <Link to="/announcement/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 no-underline">
                            <Plus size={14} /> New
                        </Link>
                    </div>
                    <div className="space-y-6 flex-1">
                        {announcements.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Megaphone size={32} className="opacity-10 mb-2" />
                                <p className="italic text-[14px]">No recent announcements found.</p>
                            </div>
                        ) : (
                            announcements.map((ann, idx) => (
                                <div key={idx} className="group relative pl-6 border-l-2 border-blue-500 hover:border-blue-700 transition-all">
                                    <div className="absolute -left-1.5 top-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                                    <h4 className="text-[15px] font-bold text-[#1d2129] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{ann.title}</h4>
                                    <p className="text-[13px] text-gray-500 mt-2 line-clamp-2 font-medium leading-relaxed">{ann.content}</p>
                                    <div className="flex items-center gap-2 mt-4">
                                        <Clock size={12} className="text-gray-400" />
                                        <p className="text-[11px] text-gray-400 uppercase font-black tracking-widest">
                                            {new Date(ann.date || ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Holidays Section */}
                <div className="bg-white p-8 rounded-2xl border border-[#d1d8dd] shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[18px] font-bold text-[#1d2129] flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                                <CalendarDays size={20} />
                            </div>
                            Upcoming Holidays
                        </h3>
                        <Link to="/holiday" className="text-blue-600 hover:text-blue-800 text-[13px] font-bold no-underline bg-blue-50 px-3 py-1.5 rounded-lg transition-all">View Calendar</Link>
                    </div>
                    <div className="space-y-4">
                        {holidays.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <CalendarDays size={32} className="opacity-10 mb-2" />
                                <p className="italic text-[14px]">No upcoming holidays listed.</p>
                            </div>
                        ) : (
                            holidays.map((hol, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-white hover:shadow-lg hover:border-orange-200 transition-all rounded-2xl border border-transparent">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100">
                                            <span className="text-[10px] font-black text-orange-500 uppercase">{new Date(hol.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                            <span className="text-[16px] font-black text-gray-900 leading-none">{new Date(hol.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-bold text-[#1d2129] uppercase tracking-tight">{hol.holidayName}</h4>
                                            <p className="text-[12px] text-gray-400 font-bold uppercase tracking-tighter">{hol.description || 'Public Holiday'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                                            {new Date(hol.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
