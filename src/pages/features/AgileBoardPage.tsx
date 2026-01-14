import React, { useEffect, useState } from 'react';
import { Layout, CheckSquare, Plus, ArrowRight } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function AgileBoardPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch tasks to simulate board columns
                const orgId = localStorage.getItem('organization_id');
                const deptId = localStorage.getItem('department_id');

                let queryParams = `?organizationId=${orgId || ''}`;
                if (deptId) {
                    queryParams += `&departmentId=${deptId}`;
                }

                const res = await fetch(`/api/resource/task${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    todo: data.filter((t: any) => t.status === 'Open').length,
                    inprogress: data.filter((t: any) => t.status === 'Working' || t.status === 'In Progress').length,
                    done: data.filter((t: any) => t.status === 'Completed').length,
                });

                setTasks(data);

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
                title="Agile Board"
                newHref="/task/new"
                newLabel="Add Task"
                summaryItems={[
                    { label: 'Backlog', value: loading ? '...' : counts.todo || 0, color: 'text-gray-500', doctype: 'task' },
                    { label: 'In Progress', value: loading ? '...' : counts.inprogress || 0, color: 'text-blue-500', doctype: 'task' },
                    { label: 'Done', value: loading ? '...' : counts.done || 0, color: 'text-emerald-500', doctype: 'task' },
                ]}
                masterCards={[
                    { label: 'Sprint View', icon: Layout, count: 'View', href: '/sprint-board' },
                    { label: 'Backlog', icon: CheckSquare, count: 'View', href: '/task-backlog' },
                ]}
                shortcuts={[
                    { label: 'New Sprint', href: '/sprint/new' },
                    { label: 'Create Task', href: '/task/new' },
                ]}
            />

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* To Do Column */}
                    <div className="bg-gray-50 rounded-xl p-4 min-h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700">To Do</h3>
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold">{counts.todo || 0}</span>
                        </div>
                        <div className="space-y-3">
                            {tasks.filter(t => t.status === 'Open').slice(0, 5).map((task, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                                    <p className="text-sm font-bold text-[#1d2129] mb-2">{task.subject}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 font-mono">{task.name}</span>
                                        <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                                            {task.owner ? task.owner.substring(0, 1).toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {counts.todo > 5 && <div className="text-center text-xs text-gray-500 mt-2">...and {counts.todo - 5} more</div>}
                        </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="bg-blue-50 rounded-xl p-4 min-h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-blue-800">In Progress</h3>
                            <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">{counts.inprogress || 0}</span>
                        </div>
                        <div className="space-y-3">
                            {tasks.filter(t => t.status === 'Working' || t.status === 'In Progress').slice(0, 5).map((task, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                                    <p className="text-sm font-bold text-[#1d2129] mb-2">{task.subject}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 font-mono">{task.name}</span>
                                        <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-[10px] font-bold">
                                            {task.owner ? task.owner.substring(0, 1).toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Done Column */}
                    <div className="bg-emerald-50 rounded-xl p-4 min-h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-emerald-800">Done</h3>
                            <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-bold">{counts.done || 0}</span>
                        </div>
                        <div className="space-y-3">
                            {tasks.filter(t => t.status === 'Completed').slice(0, 5).map((task, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm cursor-pointer opacity-75 hover:opacity-100 transition-opacity">
                                    <p className="text-sm font-bold text-[#1d2129] mb-2 line-through text-gray-500">{task.subject}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 font-mono">{task.name}</span>
                                        <CheckCircleRedux size={14} className="text-emerald-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const CheckCircleRedux = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
