import React, { useEffect, useState } from 'react';
import { Briefcase, CheckSquare, Clock, ArrowRight, Layout } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function ProjectsPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [projects, setProjects] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/project${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    active: data.filter((p: any) => p.status === 'Open' || p.status === 'In Progress').length,
                    completed: data.filter((p: any) => p.status === 'Completed').length,
                });

                setProjects(data.slice(0, 10));

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
                title="Projects Overview"
                newHref="/project/new"
                newLabel="New Project"
                summaryItems={[
                    { label: 'Total Projects', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'project' },
                    { label: 'Active', value: loading ? '...' : counts.active || 0, color: 'text-emerald-500', doctype: 'project' },
                    { label: 'Completed', value: loading ? '...' : counts.completed || 0, color: 'text-purple-500', doctype: 'project' },
                ]}
                masterCards={[
                    { label: 'All Projects', icon: Briefcase, count: counts.total || 0, href: '/project' },
                    { label: 'My Tasks', icon: CheckSquare, count: 'View', href: '/task?my_tasks=true' },
                    { label: 'Kanban Board', icon: Layout, count: 'View', href: '/project-kanban' },
                ]}
                shortcuts={[
                    { label: 'Create Project', href: '/project/new' },
                    { label: 'Agile Board', href: '/agile-board' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Briefcase size={18} className="text-blue-600" />
                            Recent Projects
                        </h3>
                        <Link to="/project" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {projects.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No projects found.</div>
                        ) : (
                            projects.map((proj, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <Briefcase size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{proj.project_name || 'Project Name'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{proj.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                            proj.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {proj.status || 'Open'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Project Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/project/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Start New Project
                        </Link>
                        <Link to="/task/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Create Task
                        </Link>
                    </div>
                </div>
                <Briefcase className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
