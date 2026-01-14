import React, { useEffect, useState } from 'react';
import { BookOpen, Table, TrendingUp, Calendar, FileText } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function GeneralLedgerPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Placeholder fetch since GL might be complex or depend on multiple doctypes
        async function fetchData() {
            try {
                // Simulate fetch or fetch GL Entry if exists
                // const res = await fetch(`/api/resource/gl-entry`);
                setEntries([]); // Default empty for now
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
                title="General Ledger"
                newHref="/gl-entry/new"
                newLabel="Manual Entry"
                summaryItems={[
                    { label: 'Total Entries', value: loading ? '...' : entries.length || 0, color: 'text-blue-500', doctype: 'gl-entry' },
                    { label: 'Debit Total', value: loading ? '...' : '$0.00', color: 'text-emerald-500', doctype: 'gl-entry' },
                    { label: 'Credit Total', value: loading ? '...' : '$0.00', color: 'text-orange-500', doctype: 'gl-entry' },
                ]}
                masterCards={[
                    { label: 'GL Entries', icon: BookOpen, count: entries.length || 0, href: '/gl-entry' },
                    { label: 'Chart of Accounts', icon: Table, count: 'View', href: '/accounts' },
                    { label: 'Trial Balance', icon: TrendingUp, count: 'Report', href: '/trial-balance' },
                ]}
                shortcuts={[
                    { label: 'Journal Entry', href: '/journal-entry/new' },
                    { label: 'Balance Sheet', href: '/balance-sheet' },
                    { label: 'Profit & Loss', href: '/profit-loss' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden p-12 text-center">
                    <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-gray-900 font-bold mb-1">General Ledger Overview</h3>
                    <p className="text-gray-500 text-[13px] mb-4">View financial transactions and account balances.</p>
                    <div className="flex justify-center gap-3">
                        <Link to="/accounts" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-[13px] hover:bg-blue-700">
                            Chart of Accounts
                        </Link>
                        <Link to="/journal-entry/new" className="inline-block bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold text-[13px] hover:bg-gray-50">
                            Make Journal Entry
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Financial Reports</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/trial-balance" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Trial Balance
                        </Link>
                        <Link to="/balance-sheet" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Balance Sheet
                        </Link>
                        <Link to="/profit-loss" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Profit & Loss
                        </Link>
                    </div>
                </div>
                <TrendingUp className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
