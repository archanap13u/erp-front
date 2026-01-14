import React from 'react';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import { Outlet } from 'react-router-dom';

export default function SuperAdminLayout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <SuperAdminSidebar />
            <main className="flex-1 ml-64 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
