import React, { useEffect, useState } from 'react';
import { Bell, Megaphone, Pin, Clock, User } from 'lucide-react';
import Workspace from '../../components/Workspace';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userCenterId, setUserCenterId] = useState(localStorage.getItem('study_center_id'));

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const orgId = localStorage.getItem('organization_id');
                const userCenter = localStorage.getItem('study_center_name');
                const userRole = localStorage.getItem('user_role');

                if (!orgId) return;

                const deptIdFromStorage = localStorage.getItem('department_id');
                const deptNameFromStorage = localStorage.getItem('department_name');

                let deptId = deptIdFromStorage;
                let deptName = deptNameFromStorage;

                // Fallback for Admins
                if (!deptName && (userRole === 'OrganizationAdmin' || userRole === 'SuperAdmin')) {
                    const path = location.pathname;
                    if (path.startsWith('/hr') || path.startsWith('/employee') || path.startsWith('/jobopening') || path.startsWith('/attendance') || path.startsWith('/holiday')) {
                        deptName = 'Human Resources';
                    } else if (path.startsWith('/ops-dashboard') || path.startsWith('/student') || path.startsWith('/university') || path.startsWith('/program') || path.startsWith('/studycenter')) {
                        deptName = 'Operations';
                    } else if (path.startsWith('/finance') || path.startsWith('/salesinvoice') || path.startsWith('/payment') || path.startsWith('/expense')) {
                        deptName = 'Finance';
                    }
                }

                const query = `?organizationId=${orgId}${deptId ? `&departmentId=${deptId}` : ''}${deptName ? `&department=${encodeURIComponent(deptName)}` : ''}`;

                const res = await fetch(`/api/resource/announcement${query}`);
                const json = await res.json();
                const data = json.data || [];

                const now = new Date();

                // Filter for announcements that target this center or 'All'
                // and are currently active
                const filtered = data.filter((ann: any) => {
                    const isVisible = !ann.endDate || now <= new Date(ann.endDate);

                    const target = (ann.targetCenter || '').toString();
                    const currentCenter = (userCenter || '').toString();

                    const nameMatch = target.toLowerCase() === 'all' || target.toLowerCase() === currentCenter.toLowerCase();
                    const idMatch = ann.targetCenter === userCenterId;
                    const roleMatch = userRole === 'Operations' || userRole === 'DepartmentAdmin';

                    const isTargeted = nameMatch || idMatch || roleMatch;

                    // DEBUG LOG for first item
                    if (data.indexOf(ann) === 0) {
                        console.log('Filter Debug Item 0:', {
                            title: ann.title,
                            targetCenter: ann.targetCenter,
                            userCenter,
                            userCenterId,
                            matches: { nameMatch, idMatch, roleMatch }
                        });
                    }

                    return isVisible && isTargeted;
                }).sort((a: any, b: any) => {
                    // Sort pinned first, then by date desc
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    return new Date(b.posting_date || b.createdAt).getTime() - new Date(a.posting_date || a.createdAt).getTime();
                });

                console.log('Raw Announcements Data:', data);
                console.log('User Center:', userCenter, 'User Center ID:', userCenterId);
                console.log('Filtered Notifications:', filtered);
                setNotifications(filtered);
            } catch (e) {
                console.error('Error fetching notifications:', e);
            } finally {
                setLoading(false);
            }
        };

        // Resolve Center ID if missing
        const resolveId = async () => {
            console.log('DEBUG: Inside resolveId functionality');
            const userRole = localStorage.getItem('user_role');
            const userCenterName = localStorage.getItem('study_center_name');

            if (userRole === 'StudyCenter' && !userCenterId && userCenterName) {
                try {
                    const orgId = localStorage.getItem('organization_id');
                    const res = await fetch(`/api/resource/studycenter?organizationId=${orgId || ''}`);
                    const json = await res.json();
                    console.log('Resolving ID. Centers fetched:', json.data); // DEBUG

                    const found = (json.data || []).find((c: any) =>
                        (c.centerName || '').toLowerCase() === (userCenterName || '').toLowerCase()
                    );

                    if (found) {
                        console.log('Found Center ID:', found._id); // DEBUG
                        setUserCenterId(found._id);
                        localStorage.setItem('study_center_id', found._id); // Save for future
                    } else {
                        console.log('Center Name NOT FOUND in list:', userCenterName); // DEBUG
                    }
                } catch (e) {
                    console.error('Resolution Error:', e);
                }
            } else {
                console.log('Skipping ID Resolution. Role:', userRole, 'Has ID:', !!userCenterId, 'Has Name:', !!userCenterName);
            }
        };

        resolveId();
        fetchNotifications();
    }, [userCenterId]);

    return (
        <div className="space-y-8 pb-20 text-[#1d2129]">
            <Workspace
                title="Notifications"
                summaryItems={[
                    { label: 'Unread Alerts', value: notifications.filter(n => !JSON.parse(localStorage.getItem('seen_announcements') || '[]').includes(n._id)).length, color: 'text-orange-500', doctype: 'announcement' },
                    { label: 'Total for You', value: notifications.length, color: 'text-blue-500', doctype: 'announcement' },
                ]}
                masterCards={[]}
                shortcuts={[]}
            />

            <div className="max-w-4xl mx-auto space-y-4">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                        <Bell className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-gray-900 font-bold mb-1">No New Notifications</h3>
                        <p className="text-gray-500 text-[13px]">
                            You're all caught up! Check back later for center updates.
                        </p>
                    </div>
                ) : (
                    notifications.map((notification, idx) => {
                        const isSeen = JSON.parse(localStorage.getItem('seen_announcements') || '[]').includes(notification._id);
                        return (
                            <div key={idx} className={`bg-white p-5 rounded-xl border border-[#d1d8dd] shadow-sm hover:shadow-md transition-all relative overflow-hidden ${!isSeen ? 'border-l-4 border-l-blue-600' : ''}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-2xl shrink-0 ${notification.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {notification.pinned ? <Pin size={20} /> : <Megaphone size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className="text-[15px] font-bold text-[#1d2129]">{notification.title}</h4>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                <Clock size={10} /> {new Date(notification.posting_date || notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
                                            {notification.content || notification.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                                                    <User size={10} /> {notification.author || 'Operations'}
                                                </span>
                                                {notification.targetCenter !== 'All' && (
                                                    <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-bold">
                                                        {notification.targetCenter}
                                                    </span>
                                                )}
                                            </div>
                                            {!isSeen && (
                                                <button
                                                    onClick={() => {
                                                        const seen = JSON.parse(localStorage.getItem('seen_announcements') || '[]');
                                                        seen.push(notification._id);
                                                        localStorage.setItem('seen_announcements', JSON.stringify(seen));
                                                        setNotifications([...notifications]); // Trigger re-render
                                                    }}
                                                    className="text-[11px] font-bold text-blue-600 hover:underline"
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
