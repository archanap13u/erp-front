import React, { useEffect, useState } from 'react';
import { School, Building2, BookOpen, GraduationCap, FileCheck, TrendingUp, Megaphone, Bell, UserCheck, Clock, CheckCircle, ClipboardList, ArrowRight, UserPlus, Search, Users } from 'lucide-react';
import Workspace from '../components/Workspace';
import { Link } from 'react-router-dom';
import AnnouncementPopup from '../components/AnnouncementPopup';

export default function CenterDashboard() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [applications, setApplications] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const centerName = localStorage.getItem('study_center_name');

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const orgId = localStorage.getItem('organization_id');
                // Use studyCenter for isolation
                let queryParams = `?organizationId=${orgId || ''}&studyCenter=${encodeURIComponent(centerName || '')}`;

                const [resStd, resApp, resMarks] = await Promise.all([
                    fetch(`/api/resource/student${queryParams}`),
                    fetch(`/api/resource/studentapplicant${queryParams}`),
                    fetch(`/api/resource/internalmark${queryParams}`)
                ]);
                const [jsonStd, jsonApp, jsonMarks] = await Promise.all([
                    resStd.json(), resApp.json(), resMarks.json()
                ]);

                const apps = jsonApp.data || [];
                const stds = jsonStd.data || [];
                setApplications(apps);
                setStudents(stds);

                setCounts({
                    student: stds.length,
                    application: apps.length,
                    marks: jsonMarks.data?.length || 0,
                    pending: apps.filter((a: any) => a.status === 'Draft').length,
                    processing: apps.filter((a: any) => a.status === 'Processed').length +
                        stds.filter((s: any) => s.verificationStatus !== 'Approved by Accounts').length,
                    completed: stds.filter((s: any) => s.verificationStatus === 'Approved by Accounts').length,
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        if (centerName) fetchDashboardData();
    }, [centerName]);

    const masterCards = [
        { icon: GraduationCap, label: 'STUDENTS', count: counts.student || 0, href: '/student' },
        { icon: UserCheck, label: 'Internal Marks', count: counts.marks || 0, href: '/internalmark' },
        { icon: Bell, label: 'Notifications', count: 'View', href: '/notifications' },
    ];

    const shortcuts = [
        { label: 'Register STUDENT', href: '/student/new' },
        { label: 'Start STUDENT', href: '/studentapplicant/new' },
        { label: 'Submit Marks', href: '/internalmark/new' },
    ];

    const ApplicationBucket = ({ title, count, status, icon: Icon, color }: any) => (
        <div className={`p-5 rounded-2xl border border-[#d1d8dd] bg-white shadow-sm hover:shadow-md transition-all group cursor-pointer`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${color} bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
                    <Icon size={20} className={color} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">View All</span>
            </div>
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">{title}</p>
            <div className="flex items-end justify-between mt-1">
                <h4 className="text-3xl font-black text-gray-900">{count}</h4>
                <div className="flex -space-x-2 pb-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400`}>
                            {i}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 text-[#1d2129] animate-in">
            <Workspace
                title={`${centerName || 'Center'} Hub`}
                newHref="/student/new"
                newLabel="Add STUDENT"
                summaryItems={[
                    { label: 'Total STUDENTS', value: loading ? '...' : counts.student, color: 'text-blue-500', doctype: 'student' },
                    { label: 'In Processing', value: loading ? '...' : counts.processing || 0, color: 'text-blue-500', doctype: 'studentapplicant' },
                    { label: 'Completed', value: loading ? '...' : counts.completed || 0, color: 'text-emerald-500', doctype: 'student' },
                ]}
                masterCards={masterCards}
                shortcuts={shortcuts}
            />

            <div className="max-w-6xl mx-auto space-y-8">


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Student Intake Card */}
                    <div className="bg-white rounded-2xl border border-[#d1d8dd] shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 bg-gray-50/50 border-b border-[#d1d8dd] flex items-center justify-between">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <UserPlus className="text-blue-600" size={24} />
                                STUDENTS & Records
                            </h3>
                            <Link to="/student/new" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[12px] font-black shadow-md hover:scale-105 transition-transform no-underline">
                                Add New STUDENT
                            </Link>
                        </div>
                        <div className="p-8 flex-1 flex flex-col justify-center text-center space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h2 className="text-[18px] font-black text-[#1d2129]">Manage STUDENTS</h2>
                                    <p className="text-[12px] text-gray-500 font-medium tracking-tight">Track, monitor, and manage your student entries</p>
                                </div>
                            </div>
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <GraduationCap size={40} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">Direct STUDENT Enrollment</h4>
                                <p className="text-gray-500 text-sm max-w-sm mx-auto">Skip the admission process and add student records directly to your roster.</p>
                            </div>
                            <div className="flex gap-4 justify-center pt-4">
                                <Link to="/student" className="text-blue-600 font-bold text-[13px] hover:underline flex items-center gap-1">
                                    View All STUDENTS <ArrowRight size={14} />
                                </Link>
                                <span className="text-gray-300">|</span>
                                <Link to="/internalmark/new" className="text-indigo-600 font-bold text-[13px] hover:underline flex items-center gap-1">
                                    Quick Submit Marks <UserCheck size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-blue-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-center">
                        <div className="relative z-10 space-y-4">
                            <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Support Portal</span>
                            <h3 className="text-3xl font-black leading-tight">Need assistance with<br />your portal?</h3>
                            <p className="text-white/70 text-[15px] leading-relaxed max-w-[340px]">Our Operations Hub is available to help with data corrections, university documents, or login issues.</p>
                            <div className="pt-4">
                                <button className="bg-white text-blue-900 px-8 py-3 rounded-xl font-black text-[14px] shadow-lg hover:scale-105 active:scale-95 transition-all">
                                    Contact Support Desk
                                </button>
                            </div>
                        </div>
                        <Building2 className="absolute right-[-40px] bottom-[-40px] text-white/5 rotate-12" size={240} />
                    </div>
                </div>

            </div>
            {/* Announcement Popup */}
            <AnnouncementPopup />
        </div>
    );
}
