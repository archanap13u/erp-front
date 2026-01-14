import React, { useEffect, useState } from 'react';
import { FileText, Users, Building2, TrendingUp, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DepartmentReportsPage() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const orgId = localStorage.getItem('organization_id');
                // Fetch departments
                const deptRes = await fetch(`/api/resource/department?organizationId=${orgId}`);
                const deptJson = await deptRes.json();
                const depts = deptJson.data || [];
                setDepartments(depts);

                // Fetch stats for each department (mocking somewhat as we might not have a direct aggregate API yet)
                // ideally we would cycle through depts and fetch employee counts, but for now we'll fetch all employees and aggregate manually
                const empRes = await fetch(`/api/resource/employee?organizationId=${orgId}`);
                const empJson = await empRes.json();
                const employees = empJson.data || [];

                const newStats: any = {};

                depts.forEach((d: any) => {
                    const deptEmps = employees.filter((e: any) => e.department === d.name);
                    newStats[d._id] = {
                        employeeCount: deptEmps.length,
                        activeCount: deptEmps.filter((e: any) => e.status === 'Active').length,
                        // Add more metrics here as available
                    };
                });

                setStats(newStats);
            } catch (error) {
                console.error("Failed to fetch department report data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-8 pb-20 text-[#1d2129] animate-in fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="text-blue-600" />
                        Department Reports
                    </h1>
                    <p className="text-gray-500 mt-1">Overview of department performance and workforce metrics.</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map(dept => {
                        const stat = stats[dept._id] || { employeeCount: 0, activeCount: 0 };
                        return (
                            <div key={dept._id} className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{dept.name}</h3>
                                            <p className="text-xs text-gray-500 font-mono">{dept.code}</p>
                                        </div>
                                    </div>
                                    {/* Link to detailed view if we had one specific for reports, for now linking to edit/view */}
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Staff</p>
                                            <p className="text-xl font-bold text-[#1d2129] mt-1">{stat.employeeCount}</p>
                                        </div>
                                        <div className="p-3 bg-emerald-50 rounded-lg">
                                            <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Active</p>
                                            <p className="text-xl font-bold text-emerald-700 mt-1">{stat.activeCount}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">Head of Dept</span>
                                            <span className="text-sm font-medium">{dept.headOfDepartment || 'N/A'}</span>
                                        </div>
                                        <Link
                                            to={`/department-reports/${dept._id}`}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                        >
                                            View Report
                                        </Link>
                                    </div>


                                    {/* Placeholder for future charts/graphs */}
                                    {/* <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-3/4"></div>
                                    </div> */}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
