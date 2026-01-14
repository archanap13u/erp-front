import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    School,
    Building2,
    BookOpen,
    GraduationCap,
    FileCheck,
    Settings,
    Grid,
    Users,
    LogOut,
    Megaphone,
    TrendingUp,
    BadgeDollarSign,
    CreditCard,
    Receipt,
    FileText,
    CalendarDays,
    UserCheck,
    Shield,
    Activity,
    ArrowLeftRight
} from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));
    const [deptId, setDeptId] = useState<string | null>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [deptFeatures, setDeptFeatures] = useState<string[]>([]);

    useEffect(() => {
        const currentRole = localStorage.getItem('user_role');
        const currentOrgId = localStorage.getItem('organization_id');
        const currentDeptId = localStorage.getItem('department_id');
        setRole(currentRole);
        setDeptId(currentDeptId);

        if (currentRole === 'OrganizationAdmin' && currentOrgId) {
            fetch(`/api/resource/department?organizationId=${currentOrgId}`)
                .then(res => res.json())
                .then(json => setDepartments(json.data || []));
        }

        if (currentRole === 'DepartmentAdmin' && currentDeptId) {
            fetch(`/api/resource/department/${currentDeptId}?organizationId=${currentOrgId}`)
                .then(res => res.json())
                .then(json => setDeptFeatures(json.data?.features || []));
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Employee Dashboard', href: '/employee-dashboard', roles: ['Employee'] },
        { icon: LayoutDashboard, label: 'Student Portal', href: '/student-dashboard', roles: ['Student'] },
        { icon: LayoutDashboard, label: 'Ops Workspace', href: '/ops-dashboard', roles: ['Operations'] },
        { icon: LayoutDashboard, label: 'Org Dashboard', href: '/organization-dashboard', roles: ['OrganizationAdmin'] },
        { icon: Settings, label: 'Customize Departments', href: '/organization/departments', roles: ['OrganizationAdmin'] },
        { icon: LayoutDashboard, label: 'Department Panel', href: `/department/${deptId}`, roles: ['DepartmentAdmin'] },

        { icon: Users, label: 'HR Workspace', href: '/hr', roles: ['HR'] },
        { icon: UserCheck, label: 'Recruitment', href: '/job-opening', roles: ['HR'] },
        { icon: Users, label: 'Employee Lifecycle', href: '/employee-onboarding', roles: ['HR'] },
        { icon: Megaphone, label: 'Employee Complaints', href: '/complaint', roles: ['HR'] },
        { icon: School, label: 'Holidays', href: '/holiday', roles: ['HR'] },
        { icon: Megaphone, label: 'Announcements', href: '/announcement', roles: ['HR'] },
        { icon: TrendingUp, label: 'Performance', href: '/performancereview', roles: ['HR'] },
        { icon: FileText, label: 'Dept Reports', href: '/department-reports', roles: ['HR'] },

        { icon: BadgeDollarSign, label: 'Finance Workspace', href: '/finance', roles: ['Finance'] },
        { icon: FileText, label: 'Invoices', href: '/salesinvoice', roles: ['Finance'] },
        { icon: CreditCard, label: 'Payments', href: '/paymententry', roles: ['Finance'] },
        { icon: Receipt, label: 'Expenses', href: '/expenseclaim', roles: ['Finance'] },

        { icon: School, label: 'Universities', href: '/university', roles: ['Operations'] },
        { icon: Building2, label: 'Study Centers', href: '/studycenter', roles: ['Operations'] },
    ];

    const employeeSessionItems = [
        { icon: UserCheck, label: 'Add Employee', href: '/employee/new', feature: 'Add Employee', roles: ['HR', 'Operations', 'DepartmentAdmin'] },
        { icon: Building2, label: 'Post Vacancy', href: '/jobopening/new', feature: 'Post Vacancy', roles: ['HR', 'Operations', 'DepartmentAdmin'] },
        { icon: ArrowLeftRight, label: 'Employee Transfer', href: '/employee-transfer', feature: 'Employee Transfer', roles: ['HR', 'Operations', 'DepartmentAdmin'] },
    ].filter(item => {
        if (role === 'DepartmentAdmin') {
            return deptFeatures.includes(item.feature);
        }
        return !role || item.roles?.includes(role);
    });

    // Feature to Link Map
    const featureMap: Record<string, { label: string, href: string, icon: any }> = {
        'Attendance': { label: 'Attendance', href: '/attendance', icon: CalendarDays },
        'Recruitment': { label: 'Recruitment', href: '/job-opening', icon: UserCheck },
        'Employee Lifecycle': { label: 'Employee Lifecycle', href: '/employee-lifecycle', icon: Users },
        'Invoices': { label: 'Invoices', href: '/salesinvoice', icon: FileText },
        'Payments': { label: 'Payments', href: '/paymententry', icon: BadgeDollarSign },
        'Expenses': { label: 'Expenses', href: '/expenseclaim', icon: Receipt },
        'General Ledger': { label: 'General Ledger', href: '/general-ledger', icon: BookOpen },
        'Taxation': { label: 'Taxation', href: '/taxation', icon: FileText },
        'Stock Entry': { label: 'Stock Entries', href: '/stockentry', icon: FileText },
        'Delivery Note': { label: 'Delivery Notes', href: '/deliverynote', icon: FileText },
        'Item Management': { label: 'Items', href: '/item', icon: Grid },
        'Purchase Receipt': { label: 'Purchase Receipts', href: '/purchase-receipt', icon: Receipt },
        'Warehouses': { label: 'Warehouses', href: '/warehouse', icon: Building2 },
        'Leads': { label: 'Leads', href: '/lead', icon: Users },
        'Deals': { label: 'Deals', href: '/deal', icon: BadgeDollarSign },
        'Customers': { label: 'Customers', href: '/customer', icon: Users },
        'Touchpoints': { label: 'Touchpoints', href: '/touchpoint', icon: Users },
        'Projects': { label: 'Projects', href: '/project', icon: FileText },
        'Tasks': { label: 'Tasks', href: '/task', icon: FileText },
        'Timesheets': { label: 'Timesheets', href: '/timesheet', icon: CalendarDays },
        'Agile Board': { label: 'Agile Board', href: '/agile-board', icon: Grid },
        'Tickets': { label: 'Tickets', href: '/ticket', icon: Shield },
        'Issues': { label: 'Issues', href: '/issue', icon: Activity },
        'Warranty Claims': { label: 'Warranty Claims', href: '/warranty', icon: Shield },
        'Knowledge Base': { label: 'Knowledge Base', href: '/kb', icon: BookOpen },
        'Asset Tracking': { label: 'Assets', href: '/asset', icon: BadgeDollarSign },
        'Maintenance': { label: 'Maintenance', href: '/maintenance', icon: Activity },
        'Depreciation': { label: 'Depreciation', href: '/depreciation', icon: TrendingUp },
        'Holidays': { label: 'Holidays', href: '/holiday', icon: CalendarDays },
        'Announcements': { label: 'Announcements', href: '/announcement', icon: Megaphone },
        'Quotations': { label: 'Quotations', href: '/quotation', icon: FileText },
        'Sales Orders': { label: 'Sales Orders', href: '/salesorder', icon: FileText },
        'Suppliers': { label: 'Suppliers', href: '/supplier', icon: Building2 },
        'Programs': { label: 'Programs', href: '/program', icon: GraduationCap },
        'University': { label: 'Universities', href: '/university', icon: School },
        'Study Center': { label: 'Study Centers', href: '/studycenter', icon: BookOpen },
        'Applications': { label: 'Applications', href: '/applications', icon: FileText },
        'Student Records': { label: 'Student Records', href: '/student-list', icon: GraduationCap }
    };

    const visibleItems = menuItems.filter(item => !role || item.roles?.includes(role));

    // Dynamic items for DepartmentAdmin
    const dynamicItems = role === 'DepartmentAdmin' ?
        deptFeatures.map(f => featureMap[f]).filter(Boolean) : [];

    return (
        <div className="w-60 h-screen bg-[#f4f5f6] border-r border-[#d1d8dd] flex flex-col fixed left-0 top-0 z-50 overflow-y-auto">
            <div className="p-4 pt-16 flex-1">
                <div className="text-[11px] font-bold text-[#8d99a6] uppercase tracking-wider mb-4 px-3 flex items-center justify-between">
                    <span>{role ? `${role} View` : 'Navigation'}</span>
                </div>
                <nav className="space-y-1">
                    {visibleItems.map((item, index) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={index}
                                to={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded text-[#1d2129] hover:bg-[#ebedef] transition-colors no-underline ${isActive ? 'bg-white shadow-sm font-bold border-l-2 border-blue-600 pl-[10px]' : 'bg-transparent'}`}
                            >
                                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[13px]">{item.label}</span>
                            </Link>
                        );
                    })}

                    {employeeSessionItems.length > 0 && (
                        <div className="mt-8">
                            <div className="text-[11px] font-bold text-[#8d99a6] uppercase tracking-wider mb-4 px-3 flex items-center justify-between">
                                <span>ADD EMPLOYEE SESSION</span>
                            </div>
                            {employeeSessionItems.map((item, index) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={`emp-${index}`}
                                        to={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded text-[#1d2129] hover:bg-[#ebedef] transition-colors no-underline ${isActive ? 'bg-white shadow-sm font-bold border-l-2 border-blue-600 pl-[10px]' : 'bg-transparent'}`}
                                    >
                                        <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="text-[13px]">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {dynamicItems.length > 0 && (
                        <>
                            <div className="my-2 border-t border-gray-200" />
                            <div className="text-[10px] font-bold text-[#8d99a6] uppercase tracking-wider mb-2 px-3">
                                Features
                            </div>
                            {dynamicItems.map((item, index) => {
                                const isActive = location.pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={`dyn-${index}`}
                                        to={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded text-[#1d2129] hover:bg-[#ebedef] transition-colors no-underline ${isActive ? 'bg-white shadow-sm font-bold border-l-2 border-blue-600 pl-[10px]' : 'bg-transparent'}`}
                                    >
                                        <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="text-[13px]">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>

                {role === 'OrganizationAdmin' && departments.length > 0 && (
                    <div className="mt-8">
                        <div className="text-[11px] font-bold text-[#8d99a6] uppercase tracking-wider mb-4 px-3">
                            Departments
                        </div>
                        <nav className="space-y-1">
                            {departments.map((dept) => {
                                const href = `/organization/department/${dept._id}`;
                                const isActive = location.pathname === href;
                                return (
                                    <Link
                                        key={dept._id}
                                        to={href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded text-[#1d2129] hover:bg-[#ebedef] transition-colors no-underline ${isActive ? 'bg-white shadow-sm font-bold border-l-2 border-blue-600 pl-[10px]' : 'bg-transparent'}`}
                                    >
                                        <Building2 size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="text-[13px] truncate">{dept.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-[#d1d8dd]">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                    <LogOut size={16} />
                    <span className="text-[13px]">Logout</span>
                </button>
            </div>
        </div>
    );
}
