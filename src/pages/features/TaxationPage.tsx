import React, { useEffect, useState } from 'react';
import { FileText, Calendar, DollarSign, Calculator, PieChart } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function TaxationPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Placeholder for tax data
        setLoading(false);
    }, []);

    return (
        <div className="space-y-8 pb-20 text-[#1d2129]">
            <Workspace
                title="Taxation & Compliance"
                newHref="/tax-filing/new"
                newLabel="New Filing"
                summaryItems={[
                    { label: 'Tax Liability', value: '$0.00', color: 'text-red-500', doctype: 'tax' },
                    { label: 'Filings Due', value: '1', color: 'text-orange-500', doctype: 'tax' },
                    { label: 'Completed', value: '0', color: 'text-emerald-500', doctype: 'tax' },
                ]}
                masterCards={[
                    { label: 'Tax Filings', icon: FileText, count: 'Manage', href: '/tax-filing' },
                    { label: 'Tax Categories', icon: Calculator, count: 'View', href: '/tax-category' },
                    { label: 'Reports', icon: PieChart, count: 'View', href: '/tax-reports' },
                ]}
                shortcuts={[
                    { label: 'Record Tax Payment', href: '/tax-payment/new' },
                    { label: 'Tax Settings', href: '/tax-settings' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                        <h3 className="text-[16px] font-bold text-[#1d2129] mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-orange-600" />
                            Upcoming Deadlines
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <div>
                                    <p className="text-[13px] font-bold text-[#1d2129]">Quarterly GST Filing</p>
                                    <p className="text-[11px] text-orange-600">Due in 15 days</p>
                                </div>
                                <Link to="/tax-filing/new" className="text-[11px] font-bold text-orange-700 hover:underline">File Now</Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                        <h3 className="text-[16px] font-bold text-[#1d2129] mb-4 flex items-center gap-2">
                            <Calculator size={18} className="text-blue-600" />
                            Tax Breakdown
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-[13px] font-medium text-gray-700">Sales Tax</span>
                                <span className="text-[13px] font-bold text-[#1d2129]">$0.00</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-[13px] font-medium text-gray-700">Income Tax</span>
                                <span className="text-[13px] font-bold text-[#1d2129]">$0.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Compliance Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/tax-filing/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            File Tax Return
                        </Link>
                        <Link to="/tax-payment/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Record Payment
                        </Link>
                    </div>
                </div>
                <DollarSign className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
