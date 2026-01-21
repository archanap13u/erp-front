import React, { useEffect, useState } from 'react';
import { Award, CheckCircle, FileText, TrendingUp, AlertCircle } from 'lucide-react';

export default function ResultPage() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchResults() {
            try {
                const orgId = localStorage.getItem('organization_id');
                // Use a hypothetical 'my-results' endpoint or filter by current user's student ID on generic resource
                // Assuming generic resource 'internalmark' returns all. Client side filter by student name if needed or backend robust filter
                // Ideally passing `studentId` or similar. 
                // For now, fetching internalmarks and matching by name (since login stores 'user_name') 
                // Note: user_name logic from Login.tsx stores the Student Name.

                const userName = localStorage.getItem('user_name');
                const res = await fetch(`/api/resource/internalmark?organizationId=${orgId || ''}`);
                const json = await res.json();

                const allMarks = json.data || [];
                // Filter by student name (exact match or partial)
                // InternalMark model has 'student' field (String name/ID).
                const myMarks = allMarks.filter((m: any) =>
                    m.student && m.student.trim().toLowerCase() === (userName || '').trim().toLowerCase()
                );

                setResults(myMarks);
            } catch (error) {
                console.error("Failed to fetch results", error);
            } finally {
                setLoading(false);
            }
        }
        fetchResults();
    }, []);

    const calculateGPA = () => {
        if (!results.length) return "0.0";
        // varied logic, placeholder
        return "N/A";
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 text-[#1d2129] space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold">Academic Transcript</h1>
                        <p className="text-indigo-100 mt-2">View your performance and grades</p>
                    </div>
                    <div className="flex gap-6 text-center">
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm min-w-[100px]">
                            <div className="text-2xl font-bold">{results.length}</div>
                            <div className="text-xs text-indigo-200 uppercase tracking-widest mt-1">Subjects</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm min-w-[100px]">
                            <div className="text-2xl font-bold">{calculateGPA()}</div>
                            <div className="text-xs text-indigo-200 uppercase tracking-widest mt-1">CGPA</div>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading results...</div>
            ) : results.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-[#d1d8dd]">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-600">No Results Found</h3>
                    <p className="text-gray-400">Results have not been published yet.</p>
                </div>
            ) : (
                <div className="bg-white border border-[#d1d8dd] rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-[#d1d8dd]">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Subject / Course</th>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Semester</th>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px] text-right">Max Marks</th>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px] text-right">Obtained</th>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px] text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {results.map((res, i) => {
                                const percentage = (res.marksObtained / res.maxMarks) * 100;
                                const passed = percentage >= 35; // Assuming 35% passing
                                return (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-800">{res.subject}</td>
                                        <td className="px-6 py-4 text-gray-600">{res.semester}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{res.maxMarks}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-800">{res.marksObtained}</td>
                                        <td className="px-6 py-4 text-center">
                                            {passed ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                                                    <CheckCircle size={12} /> Pass
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                                                    <AlertCircle size={12} /> Fail
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
