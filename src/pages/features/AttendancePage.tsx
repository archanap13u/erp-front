import React, { useEffect, useState } from 'react';
import {
    CalendarDays,
    UserCheck,
    Users,
    ArrowRight,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp
} from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function AttendancePage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const orgId = localStorage.getItem('organization_id');
                const deptId = localStorage.getItem('department_id');
                const userRole = localStorage.getItem('user_role');

                let baseUrl = `/api/resource`;
                let queryParams = `?organizationId=${orgId || ''}`;

                const isGlobalRole = userRole === 'SuperAdmin' || userRole === 'OrganizationAdmin' || userRole === 'HR';
                if (deptId && !isGlobalRole) {
                    queryParams += `&departmentId=${deptId}`;
                }

                const [resAtt, resEmp] = await Promise.all([
                    fetch(`${baseUrl}/attendance${queryParams}`),
                    fetch(`${baseUrl}/employee${queryParams}`)
                ]);

                const [jsonAtt, jsonEmp] = await Promise.all([
                    resAtt.json(), resEmp.json()
                ]);

                const attData = jsonAtt.data || [];
                const today = new Date().toISOString().split('T')[0];
                const todayRecords = attData.filter((a: any) => a.attendance_date?.startsWith(today));

                setCounts({
                    total: jsonEmp.data?.length || 0,
                    present: todayRecords.filter((a: any) => a.status === 'Present').length,
                    absent: todayRecords.filter((a: any) => a.status === 'Absent').length,
                    leave: todayRecords.filter((a: any) => a.status === 'On Leave').length,
                });

                setAttendance(todayRecords.slice(0, 10));

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const attendancePercentage = counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0;

    return (
        <div className="space-y-8 pb-20 text-[#1d2129]">
            <Workspace
                title="Attendance Management"
                newHref="/attendance/new"
                newLabel="Mark Attendance"
                summaryItems={[
                    { label: 'Total Staff', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'employee' },
                    { label: 'Present Today', value: loading ? '...' : counts.present || 0, color: 'text-emerald-500', doctype: 'attendance' },
                    { label: 'Absent Today', value: loading ? '...' : counts.absent || 0, color: 'text-red-500', doctype: 'attendance' },
                ]}
                masterCards={[
                    { label: 'Mark Attendance', icon: CalendarDays, count: '', href: '/attendance/new' },
                    { label: 'All Records', icon: UserCheck, count: '', href: '/attendance' },
                    { label: 'Reports', icon: TrendingUp, count: '', href: '/attendance/reports' },
                ]}
                shortcuts={[
                    { label: 'Mark Attendance', href: '/attendance/new' },
                    { label: 'View Reports', href: '/attendance/reports' },
                    { label: 'Attendance Settings', href: '/attendance/settings' },
                ]}
            />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Summary */}
                <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                    <h3 className="text-[16px] font-bold text-[#1d2129] mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-blue-600" />
                        Today's Summary
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-600" />
                                <span className="text-[13px] font-medium text-emerald-700">Present</span>
                            </div>
                            <span className="text-[18px] font-bold text-emerald-700">{counts.present || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-center gap-2">
                                <XCircle size={16} className="text-red-600" />
                                <span className="text-[13px] font-medium text-red-700">Absent</span>
                            </div>
                            <span className="text-[18px] font-bold text-red-700">{counts.absent || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <div className="flex items-center gap-2">
                                <CalendarDays size={16} className="text-orange-600" />
                                <span className="text-[13px] font-medium text-orange-700">On Leave</span>
                            </div>
                            <span className="text-[18px] font-bold text-orange-700">{counts.leave || 0}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium text-gray-600">Attendance Rate</span>
                            <span className="text-[14px] font-bold text-[#1d2129]">{attendancePercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-emerald-500 h-full transition-all duration-1000"
                                style={{ width: `${attendancePercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Recent Records */}
                <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Users size={18} className="text-blue-600" />
                            Today's Attendance
                        </h3>
                        <Link to="/attendance" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                        {attendance.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic text-[13px]">No attendance records for today.</div>
                        ) : (
                            attendance.map((record, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded ${record.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : record.status === 'Absent' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {record.status === 'Present' ? <CheckCircle size={16} /> : record.status === 'Absent' ? <XCircle size={16} /> : <CalendarDays size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{record.employee_name || 'Unknown Employee'}</p>
                                            <p className="text-[11px] text-gray-500">{record.employee || 'EMP-000'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[11px] px-3 py-1 rounded-full font-bold ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : record.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {record.status || 'Pending'}
                                        </span>
                                        {record.working_hours && (
                                            <p className="text-[10px] text-gray-500 mt-1">{record.working_hours} hrs</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
