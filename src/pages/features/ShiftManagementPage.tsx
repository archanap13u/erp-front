import React, { useEffect, useState } from 'react';
import {
    Clock,
    Calendar,
    Users,
    ArrowRight,
    Sunrise,
    Sunset
} from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function ShiftManagementPage() {
    const [shifts, setShifts] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/shift${queryParams}`);
                const json = await res.json();

                setShifts(json.data || []);
                setAssignments([]);

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
                title="Shift Management"
                newHref="/shift/new"
                newLabel="Create Shift"
                summaryItems={[
                    { label: 'Active Shifts', value: loading ? '...' : shifts.length || 0, color: 'text-blue-500', doctype: 'shift' },
                    { label: 'Today Assignments', value: loading ? '...' : assignments.length || 0, color: 'text-emerald-500', doctype: 'shift' },
                    { label: 'Staff on Duty', value: loading ? '...' : '0', color: 'text-purple-500', doctype: 'employee' },
                ]}
                masterCards={[
                    { label: 'Shift Types', icon: Clock, count: shifts.length || 0, href: '/shift' },
                    { label: 'Assignments', icon: Users, count: 'Manage', href: '/shift-assignment' },
                    { label: 'Roster', icon: Calendar, count: 'View', href: '/shift-roster' },
                ]}
                shortcuts={[
                    { label: 'Create New Shift', href: '/shift/new' },
                    { label: 'Assign Shifts', href: '/shift-assignment' },
                    { label: 'View Roster', href: '/shift-roster' },
                ]}
            />

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shifts.length === 0 ? (
                    <div className="col-span-3 bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                        <Clock className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-gray-900 font-bold mb-1">No Shifts Configured</h3>
                        <p className="text-gray-500 text-[13px] mb-4">Create shift types to manage employee schedules.</p>
                        <Link to="/shift/new" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-[13px] hover:bg-blue-700 transition-colors">
                            Create First Shift
                        </Link>
                    </div>
                ) : (
                    shifts.map((shift, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Clock size={24} />
                                </div>
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                                    Active
                                </span>
                            </div>
                            <h4 className="text-[16px] font-bold text-[#1d2129] mb-2">{shift.shift_type || shift.name || 'Unnamed Shift'}</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[12px] text-gray-600">
                                    <Sunrise size={14} />
                                    <span>Start: {shift.start_time || '09:00 AM'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[12px] text-gray-600">
                                    <Sunset size={14} />
                                    <span>End: {shift.end_time || '05:00 PM'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[12px] text-gray-600">
                                    <Users size={14} />
                                    <span>{shift.assigned_count || 0} assigned</span>
                                </div>
                            </div>
                            <Link to={`/shift/${shift._id || shift.name}`} className="mt-4 inline-flex items-center gap-1 text-blue-600 text-[12px] font-bold hover:underline">
                                View Details <ArrowRight size={12} />
                            </Link>
                        </div>
                    ))
                )}
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Shift Quick Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/shift/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Create New Shift
                        </Link>
                        <Link to="/shift-assignment" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Assign Employees
                        </Link>
                        <Link to="/shift-roster" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            View Weekly Roster
                        </Link>
                    </div>
                </div>
                <Clock className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
