import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, Megaphone, FileText, CheckCircle2, Clock, Award, GraduationCap } from 'lucide-react';

export default function StudentDashboard() {
    const [name, setName] = useState('');


    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        setName(storedName || 'Student');

        async function fetchData() {
            try {

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
                    <p className="text-gray-500 mt-1">LMS Student Portal</p>
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

                    {/* LMS Navigation Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/student/exams" className="p-6 bg-white border border-[#d1d8dd] rounded-xl shadow-sm hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                <Clock size={24} className="text-blue-600" />
                            </div>
                            <h3 className="text-[16px] font-bold text-gray-800">Examination Panel</h3>
                            <p className="text-[13px] text-gray-500 mt-1">View exam schedules and dates</p>
                        </Link>

                        <Link to="/student/results" className="p-6 bg-white border border-[#d1d8dd] rounded-xl shadow-sm hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                                <Award size={24} className="text-purple-600" />
                            </div>
                            <h3 className="text-[16px] font-bold text-gray-800">Result Viewing</h3>
                            <p className="text-[13px] text-gray-500 mt-1">Check your grades and transcripts</p>
                        </Link>

                        <div className="p-6 bg-white border border-[#d1d8dd] rounded-xl shadow-sm hover:shadow-md transition-all group cursor-pointer">
                            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                                <BookOpen size={24} className="text-emerald-600" />
                            </div>
                            <h3 className="text-[16px] font-bold text-gray-800">My Courses</h3>
                            <p className="text-[13px] text-gray-500 mt-1">Access course materials and syllabus</p>
                        </div>

                        <div className="p-6 bg-white border border-[#d1d8dd] rounded-xl shadow-sm hover:shadow-md transition-all group cursor-pointer">
                            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                                <GraduationCap size={24} className="text-orange-600" />
                            </div>
                            <h3 className="text-[16px] font-bold text-gray-800">Convocation</h3>
                            <p className="text-[13px] text-gray-500 mt-1">Apply for degree certificates</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">

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
