import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, Layers, Users } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function ProgramsPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [programs, setPrograms] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/program${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    active: data.filter((p: any) => p.published).length,
                });

                setPrograms(data.slice(0, 10));

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
                title="Academic Programs"
                newHref="/program/new"
                newLabel="New Program"
                summaryItems={[
                    { label: 'Total Programs', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'program' },
                    { label: 'Published', value: loading ? '...' : counts.active || 0, color: 'text-emerald-500', doctype: 'program' },
                ]}
                masterCards={[
                    { label: 'All Programs', icon: BookOpen, count: counts.total || 0, href: '/program' },
                    { label: 'Courses', icon: Layers, count: 'Manage', href: '/course' },
                ]}
                shortcuts={[
                    { label: 'Create Program', href: '/program/new' },
                    { label: 'Manage Courses', href: '/course' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <BookOpen size={18} className="text-blue-600" />
                            Recent Programs
                        </h3>
                        <Link to="/program" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {programs.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No programs found.</div>
                        ) : (
                            programs.map((prog, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <BookOpen size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{prog.program_name || 'Program Name'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{prog.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Link to={`/program/${prog.name}`} className="text-[11px] font-bold text-blue-600 hover:underline">View Details</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Program Management</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/program/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            New Program
                        </Link>
                        <Link to="/course/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Add Course
                        </Link>
                    </div>
                </div>
                <BookOpen className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
