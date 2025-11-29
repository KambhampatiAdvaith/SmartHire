// app/(main)/schedule-interview/[interviewId]/_components/CandidateList.jsx

import React from 'react';
// import moment from 'moment';
// import { Button } from '@/components/ui/button';
import CandidateFeedbackDialog from './CandidateFeedbackDialog';

/**
 * Lists candidates who have taken the interview and provides a link to their report.
 * @param {Array} candidateList - Array of interview feedback objects for the specific interview.
 */
function CandidateList({ candidateList }) {
    if (!candidateList || candidateList.length === 0) {
        return (
            <div className="bg-white p-5 rounded-lg shadow-sm mt-5 text-center text-gray-500">
                No candidates have completed this interview yet.
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">
                Candidates ({candidateList.length})
            </h3>

            <div className="flex flex-col gap-4">
                {candidateList.map((candidate, index) => (
                    <div
                        key={index}
                        className="bg-white p-4 rounded-lg border flex items-center justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            {/* Candidate Initial [05:17:11] */}
                            <div className="text-2xl bg-primary text-white p-3 rounded-full font-bold">
                                {candidate.user_name ? candidate.user_name[0] : 'U'}
                            </div>

                            {/* Name and Completion Date */}
                            <div>
                                <h4 className="font-semibold">{candidate.user_name}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Completed On: {moment(candidate.created_at).format('MMM DD, YYYY')}
                                </p>
                            </div>
                        </div>

                        {/* View Report Button (Dialog Trigger) [05:20:29] */}
                        {/* We wrap the button inside the dialog component to act as the trigger */}
                        <CandidateFeedbackDialog candidate={candidate}>
                            <Button variant="outline" className="text-primary hover:bg-primary/10">
                                View Report
                            </Button>
                        </CandidateFeedbackDialog>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CandidateList;