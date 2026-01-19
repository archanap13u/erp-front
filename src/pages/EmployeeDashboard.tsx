import React, { useEffect, useState } from 'react';
import { UserCheck, CalendarDays, Megaphone, Clock, GraduationCap, Calendar } from 'lucide-react';

export default function EmployeeDashboard() {
    const [name, setName] = useState('');
    const [empId, setEmpId] = useState('');
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Use employee ID if available, otherwise fallback to username for voting checks
    const voterId = empId || name;

    const handleVote = async (annId: string, optionLabel: string) => {
        try {
            const orgId = localStorage.getItem('organization_id');
            const res = await fetch(`/api/poll/announcement/${annId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    optionLabel,
                    employeeId: voterId,
                    organizationId: orgId
                })
            });
            const json = await res.json();
            if (res.ok) {
                setAnnouncements(prev => prev.map(a =>
                    a._id === annId ? json.data : a
                ));
            } else {
                alert(json.error || 'Failed to submit vote');
            }
        } catch (e) {
            console.error(e);
            alert('Failed to connect to server');
        }
    };

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        const storedId = localStorage.getItem('employee_id');
        setName(storedName || 'Staff Member');
        setEmpId(storedId || '');

        async function fetchData() {
            try {
                const orgId = localStorage.getItem('organization_id');
                const deptId = localStorage.getItem('department_id');
                const userRole = localStorage.getItem('user_role');

                // For regular employees/students, filter by department. 
                // For Admins (HR, DeptAdmin, Ops), verify all announcements (Global access).
                const isRestricted = userRole === 'Employee' || userRole === 'Student';
                const query = `?organizationId=${orgId || ''}${isRestricted && deptId ? `&departmentId=${deptId}` : ''}`;

                const [resAnn, resHol] = await Promise.all([
                    fetch(`/api/resource/announcement${query}`),
                    fetch(`/api/resource/holiday${query}`)
                ]);
                const [jsonAnn, jsonHol] = await Promise.all([resAnn.json(), resHol.json()]);

                // Filter announcements by date
                const now = new Date();
                const validAnnouncements = (jsonAnn.data || []).filter((a: any) => {
                    if (!a.startDate || !a.endDate) return true; // Show if no dates set (legacy support)
                    const start = new Date(a.startDate);
                    const end = new Date(a.endDate);
                    return now >= start && now <= end;
                });

                setAnnouncements(validAnnouncements);
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1d2129] flex items-center gap-2">
                        Dashboard
                        <span className="text-[12px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black uppercase text-center min-w-[60px]">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                    </h1>
                    <p className="text-[13px] text-gray-400 mt-1">Welcome back, <span className="font-bold text-gray-600">{name}</span></p>
                </div>
                {/* Profile Card / ID */}
                <div className="bg-white px-4 py-2 rounded-xl border border-dashed border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[12px]">
                        {name.charAt(0)}
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Employee ID</p>
                        <span className="font-bold text-[12px] text-gray-700">{empId || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Announcements Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-2xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#d1d8dd] bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
                            <Megaphone size={16} className="text-blue-600" />
                            <h2 className="font-bold text-[14px]">Announcements & Polls</h2>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            ) : announcements.length === 0 ? (
                                <p className="text-gray-400 italic text-center text-[13px]">No announcements available.</p>
                            ) : (
                                announcements.map((ann, idx) => {
                                    const isPoll = ann.type === 'Poll';
                                    const hasVoted = isPoll && ann.voters?.includes(voterId);
                                    const totalVotes = isPoll ? ann.pollOptions?.reduce((acc: number, opt: any) => acc + (opt.votes || 0), 0) : 0;

                                    return (
                                        <div key={idx} className="group">
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-[14px] font-bold group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                                    {ann.title}
                                                    {isPoll && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full">Poll</span>}
                                                </h3>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(ann.date || ann.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            <p className="text-[13px] text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">{ann.content}</p>

                                            {/* Poll Interface */}
                                            {isPoll && ann.pollOptions && (
                                                <div className="mt-4 space-y-2">
                                                    {ann.pollOptions.map((opt: any, optIdx: number) => {
                                                        const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                                        return (
                                                            <div key={optIdx} className="relative">
                                                                {hasVoted ? (
                                                                    // Result View
                                                                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 relative overflow-hidden">
                                                                        <div
                                                                            className="absolute top-0 left-0 h-full bg-blue-100 transition-all duration-500"
                                                                            style={{ width: `${percent}%` }}
                                                                        ></div>
                                                                        <div className="relative flex justify-between items-center text-[12px] z-10 font-medium">
                                                                            <span className="text-[#1d2129]">{opt.label}</span>
                                                                            <span className="text-blue-700">{percent}% ({opt.votes})</span>
                                                                            {/* Use check mark if user voted for this (requires tracking which option user voted for, which simplified model might not have per user, but for now just show results) */}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    // Voting View
                                                                    <button
                                                                        onClick={() => handleVote(ann._id, opt.label)}
                                                                        className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-[12px] font-medium flex items-center gap-2"
                                                                    >
                                                                        <div className="w-3 h-3 rounded-full border border-gray-400"></div>
                                                                        {opt.label}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {hasVoted && (
                                                        <p className="text-[11px] text-gray-400 mt-1 italic">You have voted on this poll.</p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-[8px] flex items-center justify-center font-bold">HR</div>
                                                <span className="text-[11px] text-gray-400">Post by {ann.postedBy || 'Admin'}</span>
                                            </div>
                                            {idx !== announcements.length - 1 && <hr className="mt-6 border-[#f0f4f7]" />}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-4 hover:bg-emerald-100 transition-colors text-left group">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-emerald-900 text-[14px]">Log Attendance</p>
                                <p className="text-[11px] text-emerald-700">Submit your daily entry</p>
                            </div>
                        </button>
                        <button className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-4 hover:bg-blue-100 transition-colors text-left group">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-blue-900 text-[14px]">Leave Request</p>
                                <p className="text-[11px] text-blue-700">Apply for time off</p>
                            </div>
                        </button>
                        <button
                            onClick={() => window.location.href = '/complaint/new'}
                            className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 hover:bg-red-100 transition-colors text-left group col-span-1 sm:col-span-2"
                        >
                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <Megaphone size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-red-900 text-[14px]">File Complaint</p>
                                <p className="text-[11px] text-red-700">Report an issue to HR</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <section className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden text-left">
                        <div className="p-4 border-b border-[#f0f4f7] bg-[#f9fafb] flex items-center gap-2">
                            <CalendarDays size={18} className="text-orange-600" />
                            <h2 className="text-[15px] font-bold">Upcoming Holidays</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="h-10 bg-gray-50 rounded"></div>
                                    <div className="h-10 bg-gray-50 rounded"></div>
                                </div>
                            ) : holidays.length === 0 ? (
                                <p className="text-gray-400 italic text-center text-[12px]">No upcoming holidays.</p>
                            ) : (
                                holidays.map((hol, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex flex-col items-center justify-center border border-orange-100 min-w-[40px]">
                                            <span className="text-[10px] font-bold text-orange-600 uppercase">
                                                {new Date(hol.date).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-[13px] font-bold text-orange-900">
                                                {new Date(hol.date).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold">{hol.holidayName}</p>
                                            <p className="text-[11px] text-gray-500">{new Date(hol.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="bg-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden text-left">
                        <div className="relative z-10">
                            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">Employee Profile</p>
                            <p className="text-[16px] font-bold mb-4">{name}</p>
                            <div className="space-y-2 opacity-90">
                                <div className="flex justify-between text-[12px]">
                                    <span>ID:</span>
                                    <span className="font-bold">{empId || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span>System:</span>
                                    <span className="font-bold">Education ERP</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <GraduationCap size={120} />
                        </div>
                    </section>
                </div>
            </div >
        </div >
    );
}
