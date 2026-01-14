import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, ArrowRight, UserPlus } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function StudentRecordsPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [students, setStudents] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/student${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    active: data.length, // Placeholder logic
                });

                setStudents(data.slice(0, 10));

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
                title="Student Records"
                newHref="/student/new"
                newLabel="Add Student"
                summaryItems={[
                    { label: 'Total Students', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'student' },
                ]}
                masterCards={[
                    { label: 'All Students', icon: Users, count: counts.total || 0, href: '/student' },
                    { label: 'Guardians', icon: UserPlus, count: 'View', href: '/guardian' },
                ]}
                shortcuts={[
                    { label: 'Add New Student', href: '/student/new' },
                    { label: 'View Guardians', href: '/guardian' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <GraduationCap size={18} className="text-blue-600" />
                            Recent Students
                        </h3>
                        <Link to="/student" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {students.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No students found.</div>
                        ) : (
                            students.map((student, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {student.first_name ? student.first_name.substring(0, 1).toUpperCase() : 'S'}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{student.first_name} {student.last_name}</p>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                <span>{student.email_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Link to={`/student/${student.name}`} className="text-[11px] font-bold text-blue-600 hover:underline">View Profile</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Student Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/student/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Add Student
                        </Link>
                    </div>
                </div>
                <Users className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
