import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Settings,
    BarChart3,
    LogOut,
    Shield,
    CreditCard
} from 'lucide-react';

export default function SuperAdminSidebar() {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/superadmin/dashboard' },
        { icon: Building2, label: 'Organizations', href: '/superadmin/organizations' },
        { icon: CreditCard, label: 'Licenses', href: '/superadmin/licenses' },
        { icon: BarChart3, label: 'Analytics', href: '/superadmin/analytics' },
        { icon: Settings, label: 'Settings', href: '/superadmin/settings' },
    ];

    return (
        <div className="w-64 h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white flex flex-col fixed left-0 top-0 z-50 overflow-y-auto">
            <div className="p-6 border-b border-indigo-700">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Super Admin</h2>
                        <p className="text-xs text-indigo-300">Platform Control</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={index}
                            to={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-white text-indigo-900 shadow-lg'
                                : 'text-indigo-100 hover:bg-indigo-800'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-indigo-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-300 hover:bg-red-900/30 transition-all font-medium"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
