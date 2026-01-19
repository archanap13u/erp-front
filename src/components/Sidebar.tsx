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
    ArrowLeftRight,
    Bell,
    ClipboardList
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
        const storedFeatures = localStorage.getItem('user_features');
        setRole(currentRole);
        setDeptId(currentDeptId);

        // Determine if we should fetch features for a specific department from the URL
        const pathParts = location.pathname.split('/');
        const urlDeptId = pathParts.includes('department') ? pathParts[pathParts.indexOf('department') + 1] : null;
        const targetDeptId = urlDeptId || currentDeptId;

        // If features are in localStorage (set during login), use them as initial state
        if (storedFeatures && !urlDeptId) {
            try {
                setDeptFeatures(JSON.parse(storedFeatures));
            } catch (e) {
                console.error('Error parsing user_features:', e);
            }
        }

        // Fetch features for the specific department (either from URL or from user session)
        if (targetDeptId && currentOrgId) {
            console.log('[Sidebar] Fetching features for target dept:', targetDeptId);
            fetch(`/api/resource/department/${targetDeptId}?organizationId=${currentOrgId}`)
                .then(res => res.json())
                .then(json => {
                    const features = json.data?.features || [];
                    console.log('[Sidebar] Loaded features:', features);
                    setDeptFeatures(features);
                    // Update localStorage ONLY if it was the session department
                    if (targetDeptId === currentDeptId) {
                        localStorage.setItem('user_features', JSON.stringify(features));
                    }
                })
                .catch(err => console.error('[Sidebar] Error fetching features:', err));
        }

        const isAllowedToSeeDepts = currentRole === 'OrganizationAdmin' || currentRole === 'HR' || currentRole === 'Operations';
        if (isAllowedToSeeDepts && currentOrgId) {
            fetch(`/api/resource/department?organizationId=${currentOrgId}`)
                .then(res => res.json())
                .then(json => setDepartments(json.data || []));
        }
    }, [location.pathname]); // Re-run when path changes to catch department jumps

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const allMenuItems = [
        // Core Dashboard Items (Role based, generally always visible for the role)
        { icon: LayoutDashboard, label: 'Dashboard', href: '/employee-dashboard', roles: ['Employee', 'DepartmentAdmin', 'HR', 'Operations', 'Finance', 'Inventory', 'CRM', 'Projects', 'Support', 'Assets'] },
        { icon: LayoutDashboard, label: 'Student Portal', href: '/student-dashboard', roles: ['Student'] },
        { icon: LayoutDashboard, label: 'Ops Workspace', href: '/ops-dashboard', roles: ['Operations'] },
        { icon: LayoutDashboard, label: 'Org Dashboard', href: '/organization-dashboard', roles: ['OrganizationAdmin'] },
        { icon: LayoutDashboard, label: 'Center Dashboard', href: '/center-dashboard', roles: ['StudyCenter'] },
        { icon: Settings, label: 'Customize Departments', href: '/organization/departments', roles: ['OrganizationAdmin'] },
        { icon: LayoutDashboard, label: 'Department Panel', href: `/department/${deptId}`, roles: ['DepartmentAdmin'] },

        // HR & Employee Management
        { icon: Users, label: 'HR Workspace', href: '/hr', roles: ['HR'], feature: 'HR Dashboard' },
        { icon: ClipboardList, label: 'Employee List', href: '/employee', roles: ['HR'], feature: 'Employee List' },
        { icon: UserCheck, label: 'Add Employee', href: '/employee/new', roles: ['HR'], feature: 'Add Employee' },
        { icon: Building2, label: 'Post Vacancy', href: '/jobopening', roles: ['HR'], feature: 'Post Vacancy' },
        { icon: ArrowLeftRight, label: 'Employee Transfer', href: '/employee-transfer', roles: ['HR'], feature: 'Employee Transfer' },
        { icon: UserCheck, label: 'Recruitment', href: '/jobopening', roles: ['HR'], feature: 'Recruitment' },
        { icon: Users, label: 'Employee Lifecycle', href: '/employee-lifecycle', roles: ['HR'], feature: 'Employee Lifecycle' },

        { icon: GraduationCap, label: 'STUDENTS', href: '/student', roles: ['HR', 'Operations', 'StudyCenter'], feature: 'STUDENTS' },
        { icon: Megaphone, label: 'Complaints', href: '/complaint', roles: ['HR'], feature: 'Employee Complaints' },
        { icon: School, label: 'Holidays', href: '/holiday', roles: ['HR', 'Operations'], feature: 'Holidays' },
        { icon: Megaphone, label: 'Announcements', href: '/announcement', roles: ['HR', 'Operations'], feature: 'Announcements' },
        { icon: TrendingUp, label: 'Performance', href: '/performancereview', roles: ['HR'], feature: 'Performance' },
        { icon: CalendarDays, label: 'Attendance', href: '/attendance', roles: ['HR', 'Employee', 'Student'], feature: 'Attendance' },

        // Finance
        { icon: BadgeDollarSign, label: 'Finance Workspace', href: '/finance', roles: ['Finance'], feature: 'Finance Dashboard' },
        { icon: FileText, label: 'Invoices', href: '/salesinvoice', roles: ['Finance'], feature: 'Invoices' },
        { icon: CreditCard, label: 'Payments', href: '/paymententry', roles: ['Finance'], feature: 'Payments' },
        { icon: Receipt, label: 'Expenses', href: '/expenseclaim', roles: ['Finance'], feature: 'Expenses' },
        { icon: BookOpen, label: 'General Ledger', href: '/ledger', roles: ['Finance'], feature: 'General Ledger' },
        { icon: FileText, label: 'Taxation', href: '/taxation', roles: ['Finance'], feature: 'Taxation' },

        // Operations
        { icon: School, label: 'Universities', href: '/university', roles: ['Operations'], feature: 'University' },
        { icon: Building2, label: 'Study Centers', href: '/studycenter', roles: ['Operations'], feature: 'Study Center' },
        { icon: GraduationCap, label: 'Programs', href: '/program', roles: ['Operations'], feature: 'Programs' },
        { icon: ClipboardList, label: 'APPLICATIONS', href: '/studentapplicant', roles: ['Operations'], feature: 'APPLICATIONS' },
        { icon: UserCheck, label: 'Internal Marks', href: '/internalmark', roles: ['Operations', 'StudyCenter'], feature: 'Internal Marks' },

        // CRM & Sales
        { icon: Megaphone, label: 'Leads', href: '/lead', roles: ['CRM'], feature: 'Leads' },
        { icon: BadgeDollarSign, label: 'Deals', href: '/deal', roles: ['CRM'], feature: 'Deals' },
        { icon: Users, label: 'Customers', href: '/customer', roles: ['CRM'], feature: 'Customers' },
        { icon: FileText, label: 'Quotations', href: '/quotation', roles: ['CRM'], feature: 'Quotations' },
        { icon: FileText, label: 'Sales Orders', href: '/salesorder', roles: ['CRM'], feature: 'Sales Orders' },

        // Inventory
        { icon: Grid, label: 'Items', href: '/item', roles: ['Inventory'], feature: 'Item Management' },
        { icon: Building2, label: 'Suppliers', href: '/supplier', roles: ['Inventory'], feature: 'Suppliers' },
        { icon: Receipt, label: 'Purchase Receipts', href: '/purchase-receipt', roles: ['Inventory'], feature: 'Purchase Receipt' },
        { icon: FileText, label: 'Stock Entries', href: '/stockentry', roles: ['Inventory'], feature: 'Stock Entry' },
        { icon: Building2, label: 'Warehouses', href: '/warehouse', roles: ['Inventory'], feature: 'Warehouses' },

        // Projects
        { icon: FileText, label: 'Projects', href: '/project', roles: ['Projects'], feature: 'Projects' },
        { icon: ClipboardList, label: 'Tasks', href: '/task', roles: ['Projects'], feature: 'Tasks' },
        { icon: CalendarDays, label: 'Timesheets', href: '/timesheet', roles: ['Projects'], feature: 'Timesheets' },

        // Support
        { icon: Shield, label: 'Tickets', href: '/ticket', roles: ['Support'], feature: 'Tickets' },
        { icon: Activity, label: 'Issues', href: '/issue', roles: ['Support'], feature: 'Issues' },

        // Assets
        { icon: BadgeDollarSign, label: 'Assets', href: '/asset', roles: ['Assets'], feature: 'Asset Tracking' },

        // Shared
        { icon: Bell, label: 'Notifications', href: '/notifications', roles: [] }, // Available for all roles
    ];

    const filteredItems = allMenuItems.filter(item => {
        // 1. Basic Role Check (if roles are specified)
        const roleAllowed = !item.roles || item.roles.length === 0 || (role && item.roles.includes(role));
        if (!roleAllowed && role !== 'DepartmentAdmin') return false;

        // 2. Strict Feature Check for Department Admin/Customized Panels
        if (role === 'DepartmentAdmin' || (deptFeatures && deptFeatures.length > 0)) {
            // Always show basic navigation items (Dashboard, Notifications)
            if (!item.feature) return roleAllowed;

            // For other items, strictly check if the feature is in the selected list
            return deptFeatures.includes(item.feature);
        }

        return roleAllowed;
    });

    // Remove duplicates based on label (case-insensitive)
    const uniqueFilteredItems = filteredItems.filter((item, index, self) =>
        index === self.findIndex((t) => (
            t.label.toLowerCase() === item.label.toLowerCase()
        ))
    );

    return (
        <div className="w-60 h-screen bg-[#f4f5f6] border-r border-[#d1d8dd] flex flex-col fixed left-0 top-0 z-50 overflow-y-auto">
            <div className="p-4 pt-16 flex-1">
                <div className="text-[11px] font-bold text-[#8d99a6] uppercase tracking-wider mb-4 px-3 flex items-center justify-between">
                    <span>{role ? `${role.replace('Admin', '')} View` : 'Navigation'}</span>
                </div>
                <nav className="space-y-1">
                    {uniqueFilteredItems.map((item, index) => {
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
                </nav>

                {/* Contextual Sub-Panels (Isolated to HR, Ops, and Department Workspaces) */}
                {departments.length > 0 && (location.pathname.startsWith('/hr') || location.pathname.startsWith('/ops-dashboard') || location.pathname.includes('/department')) && (
                    <div className="mt-8 animate-in slide-in-from-left duration-500">
                        <div className="text-[11px] font-bold text-[#8d99a6] uppercase tracking-wider mb-4 px-3 flex items-center justify-between">
                            <span>Sub-Panels</span>
                            <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-tighter">Workspace</span>
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
