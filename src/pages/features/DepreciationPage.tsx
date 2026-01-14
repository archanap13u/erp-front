import React, { useEffect, useState } from 'react';
import { TrendingDown, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function DepreciationPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Placeholder for depreciation
        setLoading(false);
    }, []);

    return (
        <div className="space-y-8 pb-20 text-[#1d2129]">
            <Workspace
                title="Asset Depreciation"
                newHref="/asset-depreciation-schedule"
                newLabel="View Schedule"
                summaryItems={[
                    { label: 'Total Value', value: '$0.00', color: 'text-blue-500', doctype: 'asset' },
                    { label: 'Depreciated', value: '$0.00', color: 'text-orange-500', doctype: 'asset' },
                ]}
                masterCards={[
                    { label: 'Depreciation Entries', icon: TrendingDown, count: 'View', href: '/depreciation-entry' },
                ]}
                shortcuts={[
                    { label: 'Process Depreciation', href: '/process-depreciation' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm p-12 text-center">
                    <TrendingDown className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-gray-900 font-bold mb-1">Depreciation Overview</h3>
                    <p className="text-gray-500 text-[13px] mb-4">Track asset value reduction over time.</p>
                    <Link to="/asset" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-[13px] hover:bg-blue-700">
                        View All Assets
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Depreciation Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/process-depreciation" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Process Depreciation
                        </Link>
                    </div>
                </div>
                <DollarSign className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
