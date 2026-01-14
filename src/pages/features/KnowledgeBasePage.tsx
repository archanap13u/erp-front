import React, { useEffect, useState } from 'react';
import { Book, Search, FileText, ArrowRight } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function KnowledgeBasePage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [articles, setArticles] = useState<any[]>([]);
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

                // 'Help Article' or 'Knowledge Base' doctype
                const res = await fetch(`/api/resource/helparticle${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    published: data.filter((a: any) => a.published).length,
                });

                setArticles(data.slice(0, 10));

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
                title="Knowledge Base"
                newHref="/helparticle/new"
                newLabel="New Article"
                summaryItems={[
                    { label: 'Total Articles', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'helparticle' },
                    { label: 'Published', value: loading ? '...' : counts.published || 0, color: 'text-emerald-500', doctype: 'helparticle' },
                ]}
                masterCards={[
                    { label: 'All Articles', icon: Book, count: counts.total || 0, href: '/helparticle' },
                    { label: 'Help Categories', icon: FileText, count: 'Manage', href: '/help-category' },
                ]}
                shortcuts={[
                    { label: 'Write Article', href: '/helparticle/new' },
                    { label: 'Help Categories', href: '/help-category' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search help articles..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 bg-opacity-50"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Book size={18} className="text-blue-600" />
                            Recent Articles
                        </h3>
                        <Link to="/helparticle" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {articles.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No knowledge base articles found.</div>
                        ) : (
                            articles.map((art, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{art.title || 'Article Title'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{art.category || 'General'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Link to={`/helparticle/${art.name}`} className="text-[11px] font-bold text-blue-600 hover:underline">Read</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">KB Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/helparticle/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Draft Article
                        </Link>
                    </div>
                </div>
                <Book className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
