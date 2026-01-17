import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building, MapPin, Award, ArrowLeft, Edit, Globe, Mail, CheckCircle, Info } from 'lucide-react';
import Workspace from '../../components/Workspace'; // Reuse layout styles if needed or just nice header

export default function UniversityDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [university, setUniversity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');

    useEffect(() => {
        async function fetchUniversity() {
            try {
                const res = await fetch(`/api/resource/university/${id}`);
                const json = await res.json();
                if (json.data) {
                    setUniversity(json.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchUniversity();
    }, [id]);

    if (loading) return <div className="p-12 text-center text-gray-500 italic">Loading university details...</div>;
    if (!university) return <div className="p-12 text-center text-red-500">University not found.</div>;

    const facilitiesList = university.facilities ? (Array.isArray(university.facilities) ? university.facilities : university.facilities.split(',').map((f: string) => f.trim())) : [];

    return (
        <div className="pb-20 bg-gray-50 min-h-screen text-[#1d2129]">
            {/* Hero Section */}
            <div className="relative h-64 md:h-80 w-full bg-slate-900 overflow-hidden">
                {university.bannerImage ? (
                    <img src={university.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-80" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Back Button */}
                <div className="absolute top-6 left-6 z-20">
                    <Link to="/university" className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all">
                        <ArrowLeft size={16} /> Back to List
                    </Link>
                </div>

                {/* Edit Button */}
                <div className="absolute top-6 right-6 z-20">
                    <Link to={`/university/${id}/edit`} className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-lg transition-all font-bold text-sm">
                        <Edit size={16} /> Edit Profile
                    </Link>
                </div>

                {/* University Info Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex items-end gap-6 z-10">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-2xl p-2 flex-shrink-0">
                        {university.logo ? (
                            <img src={university.logo} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                        ) : (
                            <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-3xl">
                                {university.universityName?.[0]}
                            </div>
                        )}
                    </div>
                    <div className="text-white pb-2 flex-1">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-white shadow-black drop-shadow-md">
                            {university.universityName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium opacity-90">
                            {university.country && (
                                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-400" /> {university.country}</span>
                            )}
                            {university.email && (
                                <span className="flex items-center gap-1.5"><Mail size={16} className="text-emerald-400" /> {university.email}</span>
                            )}
                            {university.accreditations && (
                                <span className="flex items-center gap-1.5 bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-md border border-white/10">
                                    <Award size={14} className="text-yellow-400" /> {university.accreditations}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="max-w-6xl mx-auto px-6 mt-8">
                <div className="flex border-b border-gray-200 mb-8">
                    {['about', 'facilities', 'programs', 'contact'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === tab
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === 'about' && (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Info size={20} className="text-blue-500" /> About University
                                </h3>
                                <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                    {university.description || 'No description provided.'}
                                </div>
                            </div>
                        )}

                        {activeTab === 'facilities' && (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Building size={20} className="text-orange-500" /> Campus Facilities
                                </h3>
                                {facilitiesList.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {facilitiesList.map((facility: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                                                <span className="font-medium text-gray-700">{facility}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">No facilities listed.</p>
                                )}
                            </div>
                        )}

                        {/* Placeholder for Programs Tab (could load linked programs later) */}
                        {activeTab === 'programs' && (
                            <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-dashed border-gray-300 animate-in fade-in">
                                <p className="text-gray-500">Program listing linked to this university will appear here.</p>
                                <Link to="/program/new" className="inline-block mt-4 text-blue-600 font-bold hover:underline">
                                    + Add New Program
                                </Link>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
                                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                                <div className="space-y-4">
                                    {university.address && (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
                                            <p className="font-medium mt-1">{university.address}</p>
                                        </div>
                                    )}
                                    {university.email && (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                                            <p className="font-medium mt-1 text-blue-600">{university.email}</p>
                                        </div>
                                    )}
                                    {/* Add Phone/Web if available in schema later */}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-4">Quick Stats</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Status</span>
                                    <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded">Active Partner</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Joined</span>
                                    <span className="text-gray-900 font-medium text-sm">
                                        {new Date(university.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-4">Quick Actions</h4>
                            <div className="space-y-3">
                                <Link to="/program/new" className="block w-full text-center bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors">
                                    + Add New Program
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
