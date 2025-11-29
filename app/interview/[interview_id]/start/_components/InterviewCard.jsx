// src/components/InterviewCard.jsx (Reconstructed)

"use client";

import React from 'react';
// NOTE: These utility/UI imports must be present in your project:
// import { Button } from '@/components/ui/button';
// import { Copy, Send, ArrowRight } from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';

/**
 * Renders a single interview card.
 * @param {object} interview - The interview data object from Supabase.
 * @param {boolean} viewDetail - If true, shows a "View Detail" button instead of copy/send.
 */
const InterviewCard = ({ interview, viewDetail = false }) => {
    // 1. Construct the interview URL [04:35:40]
    const interviewUrl = `${process.env.NEXT_PUBLIC_HOST_URL}/interview/${interview.interview_id}`;

    // 2. Handler for copying the link to clipboard [04:34:47]
    const copyLink = () => {
        navigator.clipboard.writeText(interviewUrl);
        toast.success("Link Copied!");
    };

    // 3. Handler for sending the link via email [04:37:04]
    const onSend = () => {
        const subject = `AI Recruiter Interview Link for ${interview.job_position}`;
        const body = `Hello,\n\nYour AI Interview Link: ${interviewUrl}`;

        // Opens the user's default email client
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    // 4. Logic to get the number of candidates (Used in Schedule Interview screen) [05:28:47]
    const candidateCount = interview.interview_feedback ? interview.interview_feedback.length : 0;

    // 5. Navigation logic for View Detail (Assumes Next.js Link/Router)
    // NOTE: Replace with your actual Link component import and path structure if needed
    const detailPath = `/schedule-interview/${interview.interview_id}/details`;

    return (
        <div className="p-5 bg-white rounded-lg border hover:shadow-md transition duration-150">
            {/* Top Row: Icon/Indicator and Date [04:28:48] */}
            <div className="flex justify-between items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                    {/* Simple Logo Placeholder (or an icon) */}
                    AI
                </div>
                <h2 className="text-xs text-gray-500">
                    {moment(interview.created_at).format('MMM DD, YYYY')}
                </h2>
            </div>

            {/* Job Position and Duration [04:32:18] */}
            <h2 className="font-bold text-lg mt-3">{interview.job_position}</h2>
            <div className="flex justify-between items-center">
                <h3 className="text-sm text-gray-700 mt-1">{interview.duration}</h3>

                {/* Candidate Count (Visible only if viewDetail is true) [05:28:47] */}
                {viewDetail && (
                    <span className={`text-sm font-medium ${candidateCount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                        {candidateCount} {candidateCount === 1 ? 'Candidate' : 'Candidates'}
                    </span>
                )}
            </div>

            {/* Action Buttons [04:33:14] */}
            <div className="mt-5 flex gap-3">
                {viewDetail ? (
                    // Button for Schedule Interview Screen [05:20:29]
                    <a href={detailPath} className="w-full">
                        <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10">
                            {/* ArrowRight Icon Placeholder */}
                            View Details
                        </Button>
                    </a>
                ) : (
                    // Default Buttons for Latest Interviews Screen [04:33:14]
                    <>
                        <Button
                            variant="outline"
                            className="w-full text-primary border-primary hover:bg-primary/10"
                            onClick={copyLink}
                        >
                            {/* Copy Icon Placeholder */}
                            Copy Link
                        </Button>
                        <Button
                            className="w-full"
                            onClick={onSend}
                        >
                            {/* Send Icon Placeholder */}
                            Send
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default InterviewCard;