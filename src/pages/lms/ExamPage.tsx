import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';

export default function ExamPage() {
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function fetchExams() {
            try {
                // Fetch exams for the organization (filtering by student's program/semester would be ideal if available)
                // For now, fetching all and client-side filtering or assume API handles context
                const orgId = localStorage.getItem('organization_id');
                const res = await fetch(`/api/resource/examschedule?organizationId=${orgId || ''}`);
                const data = await res.json();
                setExams(data.data || []);
            } catch (error) {
                console.error("Failed to fetch exams", error);
            } finally {
                setLoading(false);
            }
        }
        fetchExams();
    }, []);

    const filteredExams = exams.filter(exam =>
        exam.subject?.toLowerCase().includes(search.toLowerCase()) ||
        exam.semester?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 text-[#1d2129] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Examination Schedule</h1>
                    <p className="text-gray-500 mt-1">Check your upcoming exam dates and venues</p>
                </div>
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search subject..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-[#d1d8dd] rounded-lg text-sm focus:border-blue-500 outline-none w-full md:w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading schedule...</div>
            ) : filteredExams.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-[#d1d8dd]">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-600">No Exams Scheduled</h3>
                    <p className="text-gray-400">There are no upcoming exams posted yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExams.map((exam, i) => (
                        <div key={i} className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm hover:shadow-md transition-shadow p-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <div className="mb-4">
                                <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                    {exam.semester || 'Semester N/A'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{exam.subject}</h3>
                            <p className="text-sm text-gray-500 mb-6">{exam.program?.programName || 'Program Code: ' + (exam.program || 'N/A')}</p>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Calendar size={16} className="text-blue-500" />
                                    <span>{new Date(exam.examDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Clock size={16} className="text-orange-500" />
                                    <span>{exam.startTime} - {exam.endTime}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <MapPin size={16} className="text-emerald-500" />
                                    <span>{exam.venue || 'TBA'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
