import React, { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, Megaphone, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function StudentDashboard() {
    const [name, setName] = useState('');
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        setName(storedName || 'Student');

        async function fetchData() {
            try {
                const orgId = localStorage.getItem('organization_id');
                const query = `?organizationId=${orgId || ''}`;

                const [resAnn, resHol] = await Promise.all([
                    fetch(`/api/resource/announcement${query}`),
                    fetch(`/api/resource/holiday${query}`)
                ]);
                const [jsonAnn, jsonHol] = await Promise.all([resAnn.json(), resHol.json()]);
                setAnnouncements(jsonAnn.data || []);
                setHolidays(jsonHol.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto text-[#1d2129]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Welcome, {name}</h1>
                    <p className="text-gray-500 mt-1">Your personal Student Portal</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white p-3 rounded-lg border border-[#d1d8dd] flex items-center gap-3 shadow-sm">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile Status</p>
                            <p className="text-[13px] font-semibold text-emerald-600">Active Student</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-[#f0f4f7] bg-[#f9fafb] flex items-center gap-2">
                            <Megaphone size={18} className="text-blue-600" />
                            <h2 className="text-[15px] font-bold">University Announcements</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                                </div>
                            ) : announcements.length === 0 ? (
                                <p className="text-gray-400 italic text-center py-4">No recent announcements.</p>
                            ) : (
                                announcements.map((ann, idx) => (
                                    <div key={idx} className="border-l-4 border-blue-500 pl-4">
                                        <h3 className="text-[14px] font-bold">{ann.title}</h3>
                                        <p className="text-[13px] text-gray-600 mt-2">{ann.content}</p>
                                        <p className="text-[10px] text-gray-400 mt-3 uppercase font-bold">{new Date(ann.date || ann.createdAt).toLocaleDateString()}</p>
                                        {idx !== announcements.length - 1 && <hr className="mt-6 border-gray-50" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-md">
                            <FileText size={24} className="mb-4 opacity-80" />
                            <h3 className="text-[18px] font-bold">1 Active Application</h3>
                            <p className="text-blue-100 text-[12px] mt-1">Check status in Admission portal</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white shadow-md">
                            <BookOpen size={24} className="mb-4 opacity-80" />
                            <h3 className="text-[18px] font-bold">Enrollment Verified</h3>
                            <p className="text-emerald-100 text-[12px] mt-1">Programs: Higher Education</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <section className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-[#f0f4f7] bg-[#f9fafb] flex items-center gap-2">
                            <CalendarDays size={18} className="text-orange-600" />
                            <h2 className="text-[15px] font-bold">Holiday Calendar</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {holidays.length === 0 ? (
                                <p className="text-gray-400 italic text-center py-4">No upcoming holidays.</p>
                            ) : (
                                holidays.map((hol, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="text-center min-w-[40px]">
                                            <p className="text-[10px] font-bold text-orange-600 uppercase">{new Date(hol.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                                            <p className="text-[16px] font-bold text-gray-800">{new Date(hol.date).getDate()}</p>
                                        </div>
                                        <div className="border-l border-gray-100 pl-4 text-left">
                                            <p className="text-[13px] font-bold">{hol.holidayName}</p>
                                            <p className="text-[11px] text-gray-500">Public Holiday</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <div className="p-6 bg-[#f0f4f7] rounded-xl border border-[#d1d8dd]">
                        <h4 className="text-[14px] font-bold mb-4">Support Contact</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock size={14} />
                                <span className="text-[12px]">Daily 09:00 - 18:00</span>
                            </div>
                            <button className="w-full bg-white border border-[#d1d8dd] py-2 rounded text-[13px] font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                                Email University Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
