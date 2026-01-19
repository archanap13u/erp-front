import React, { useState } from 'react';
import { CheckCircle2, Circle, Loader2, BarChart3 } from 'lucide-react';

interface PollOption {
    label: string;
    votes: number;
}

interface PollProps {
    announcement: any;
    voterId: string; // Employee ID or Center ID
    doctype?: string; // e.g. 'announcement' or 'opsannouncement'
    onVoteSuccess?: (updatedAnnouncement: any) => void;
}

export default function PollWidget({ announcement, voterId, doctype = 'opsannouncement', onVoteSuccess }: PollProps) {
    const [submitting, setSubmitting] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Check if already voted
    const hasVoted = announcement.voters?.includes(voterId);

    // Calculate total votes for percentage
    const totalVotes = announcement.pollOptions?.reduce((acc: number, curr: PollOption) => acc + (curr.votes || 0), 0) || 0;

    const handleVote = async () => {
        if (!selectedOption || submitting || hasVoted) return;

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch(`/api/poll/${doctype}/${announcement._id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    optionLabel: selectedOption,
                    voterId: voterId
                })
            });

            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Failed to vote');

            if (onVoteSuccess) {
                onVoteSuccess(json.data);
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (announcement.type?.toLowerCase() !== 'poll' || !announcement.pollOptions?.length) return null;

    return (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                <BarChart3 size={16} className="text-blue-600" />
                Poll: Share your opinion
            </div>

            <div className="space-y-2">
                {announcement.pollOptions.map((opt: PollOption, idx: number) => {
                    const percentage = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                    // Note: We cannot know which option the user voted for if they reload, 
                    // as the schema only stores 'voters' ID list, not their choice.
                    const isSelected = selectedOption === opt.label;

                    return (
                        <div key={idx} className="relative">
                            {/* Result Mode (if voted) */}
                            {hasVoted ? (
                                <div className="relative h-10 w-full bg-gray-200 rounded-md overflow-hidden border border-gray-300">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-blue-200 transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-between px-3 text-sm font-medium text-gray-700 z-10">
                                        <span>{opt.label}</span>
                                        <span>{percentage}% ({opt.votes})</span>
                                    </div>
                                </div>
                            ) : (
                                /* Vote Mode */
                                <button
                                    onClick={() => setSelectedOption(opt.label)}
                                    className={`w-full flex items-center justify-between p-3 rounded-md border text-sm transition-all ${isSelected
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-500'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected ? <CheckCircle2 size={16} className="text-blue-600" /> : <Circle size={16} className="text-gray-300" />}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

            {!hasVoted && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleVote}
                        disabled={!selectedOption || submitting}
                        className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {submitting && <Loader2 size={12} className="animate-spin" />}
                        Submit Vote
                    </button>
                </div>
            )}

            {hasVoted && (
                <p className="text-center text-xs text-green-600 font-medium mt-3">
                    Thank you for voting!
                </p>
            )}
        </div>
    );
}
