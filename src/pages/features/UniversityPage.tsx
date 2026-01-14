import React, { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, Users, ArrowRight, Building } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function UniversityPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [universities, setUniversities] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/university${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    active: data.filter((u: any) => u.enabled).length,
                });

                setUniversities(data.slice(0, 10));

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
                title="University Management"
                newHref="/university/new"
                newLabel="Add University"
                summaryItems={[
                    { label: 'Total Universities', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'university' },
                    { label: 'Partner Institutions', value: loading ? '...' : counts.active || 0, color: 'text-emerald-500', doctype: 'university' },
                ]}
                masterCards={[
                    { label: 'All Universities', icon: GraduationCap, count: counts.total || 0, href: '/university' },
                    { label: 'Programs', icon: BookOpen, count: 'Manage', href: '/program' },
                    { label: 'Students', icon: Users, count: 'View', href: '/student' },
                ]}
                shortcuts={[
                    { label: 'Add University', href: '/university/new' },
                    { label: 'View Programs', href: '/program' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <GraduationCap size={18} className="text-blue-600" />
                            Recent Universities
                        </h3>
                        <Link to="/university" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {universities.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No universities found.</div>
                        ) : (
                            universities.map((uni, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <Building size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{uni.university_name || 'Detailed Name'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{uni.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Link to={`/university/${uni.name}`} className="text-[11px] font-bold text-blue-600 hover:underline">View Details</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">University Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/university/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Register University
                        </Link>
                        <Link to="/program/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Add Program
                        </Link>
                    </div>
                </div>
                <GraduationCap className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
