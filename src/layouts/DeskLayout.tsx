import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DeskLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [authorized, setAuthorized] = useState(!!localStorage.getItem('user_role'));

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (!role) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="flex h-screen overflow-hidden">
            <Navbar />
            <div className="flex flex-1 pt-12">
                <Sidebar />
                <main className="flex-1 ml-60 overflow-y-auto px-12 py-8 bg-[#f4f5f6]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
