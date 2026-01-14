import React, { useEffect, useState } from 'react';
import {
    Users,
    UserPlus,
    TrendingUp,
    ArrowRight,
    Award,
    Target
} from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function EmployeeLifecyclePage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [employees, setEmployees] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/employee${queryParams}`);
                const json = await res.json();

                const data = json.data || [];
                const now = new Date();
                const thisMonth = data.filter((e: any) => new Date(e.date_of_joining).getMonth() === now.getMonth());

                setCounts({
                    total: data.length,
                    newHires: thisMonth.length,
                    active: data.filter((e: any) => e.status === 'Active').length,
                });

                setEmployees(data.slice(0, 10));

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
                title="Employee Lifecycle Management"
                newHref="/employee/new"
                newLabel="Add Employee"
                summaryItems={[
                    { label: 'Total Employees', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'employee' },
                    { label: 'New Hires (This Month)', value: loading ? '...' : counts.newHires || 0, color: 'text-emerald-500', doctype: 'employee' },
                    { label: 'Active Employees', value: loading ? '...' : counts.active || 0, color: 'text-purple-500', doctype: 'employee' },
                ]}
                masterCards={[
                    { label: 'Onboarding', icon: UserPlus, count: 'Manage', href: '/onboarding' },
                    { label: 'Performance', icon: Award, count: 'Review', href: '/performance' },
                    { label: 'Transfers', icon: Users, count: 'View', href: '/employee-transfer' },
                ]}
                shortcuts={[
                    { label: 'New Employee Onboarding', href: '/employee/new' },
                    { label: 'Performance Reviews', href: '/performance' },
                    { label: 'Exit Management', href: '/employee-exit' },
                ]}
            />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <UserPlus size={18} className="text-emerald-600" />
                            Onboarding Pipeline
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[12px] font-bold text-blue-600 uppercase">New Hires</span>
                                <span className="text-[18px] font-bold text-blue-700">{counts.newHires || 0}</span>
                            </div>
                            <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full" style={{ width: '65%' }}></div>
                            </div>
                            <p className="text-[10px] text-blue-500 mt-1">This month</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-[12px] font-medium text-gray-700">Documentation Pending</span>
                                <span className="text-[12px] font-bold text-orange-600">3</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-[12px] font-medium text-gray-700">Training In Progress</span>
                                <span className="text-[12px] font-bold text-blue-600">5</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Award size={18} className="text-purple-600" />
                            Performance Management
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                                <p className="text-[11px] font-bold text-purple-600 uppercase mb-1">Reviews Due</p>
                                <p className="text-2xl font-bold text-purple-700">12</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                <p className="text-[11px] font-bold text-emerald-600 uppercase mb-1">Completed</p>
                                <p className="text-2xl font-bold text-emerald-700">45</p>
                            </div>
                        </div>
                        <Link to="/performance" className="block w-full text-center py-3 bg-purple-600 text-white rounded-lg font-bold text-[13px] hover:bg-purple-700 transition-colors">
                            Manage Performance Reviews
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Lifecycle Quick Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/employee/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Onboard New Employee
                        </Link>
                        <Link to="/performance" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Performance Review
                        </Link>
                        <Link to="/employee-transfer" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Transfer Employee
                        </Link>
                    </div>
                </div>
                <Users className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
