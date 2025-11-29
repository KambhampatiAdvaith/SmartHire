// app/(main)/schedule-interview/[interviewId]/_components/CandidateFeedbackDialog.jsx

import React from 'react';
// Imports for shadcn/ui Dialog and Button components
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Progress } from '@/components/ui/progress';

/**
 * Displays the AI-generated feedback report for a specific candidate.
 * @param {object} candidate - The interview feedback object for the candidate.
 * @param {React.ReactNode} children - The trigger element (i.e., the "View Report" button).
 */
function CandidateFeedbackDialog({ candidate, children }) {
    // Safely parse the nested feedback JSON field [05:31:50]
    const feedback = candidate.feedback ? candidate.feedback.feedback : {};

    // Get the core sections
    const ratings = feedback.rating || {};
    const summary = feedback.summary || [];
    const recommendation = feedback.recommendation || {};

    // Determine the overall recommendation style [05:36:57]
    const isRecommended = recommendation.recommendation === 'Yes';
    const recBgColor = isRecommended ? 'bg-green-100' : 'bg-red-100';
    const recTextColor = isRecommended ? 'text-green-700' : 'text-red-700';

    return (
        // Dialogue component setup (shadcn/ui or similar)
        <Dialog>
            {/* The child (Button) is the trigger [05:24:40] */}
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>AI Interview Report</DialogTitle>
                    <DialogDescription className="pt-2">
                        Detailed assessment for candidate: **{candidate.user_name}**
                    </DialogDescription>
                </DialogHeader>

                {/* --- Candidate Header and Overall Rating --- */}
                <div className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center gap-4">
                        {/* Candidate Initial [05:27:14] */}
                        <div className="text-2xl bg-primary text-white p-3 rounded-full font-bold">
                            {candidate.user_name ? candidate.user_name[0] : 'U'}
                        </div>
                        {/* Overall Rating (e.g., 8/10) */}
                        <h3 className="text-3xl font-bold text-primary">
                            {ratings.overall_rating || 'N/A'}/10
                        </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                        Interview Date: {moment(candidate.created_at).format('MMM DD, YYYY h:mm A')}
                    </p>
                </div>

                {/* -------------------------------------- */}
                {/* --- 1. Skill Assessment Ratings [05:29:08] --- */}
                {/* -------------------------------------- */}
                <div className="mt-4">
                    <h4 className="text-lg font-bold mb-3">Skill Assessment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                        {Object.entries(ratings).filter(([key]) => key !== 'overall_rating').map(([skill, score]) => (
                            <div key={skill} className="flex flex-col gap-1">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>{skill.replace(/_/g, ' ')}:</span>
                                    <span>{score}/10</span>
                                </div>
                                {/* Progress Bar [05:29:52] */}
                                <Progress value={score * 10} className="h-2" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* -------------------------------------- */}
                {/* --- 2. Performance Summary [05:34:05] --- */}
                {/* -------------------------------------- */}
                <div className="mt-6">
                    <h4 className="text-lg font-bold mb-3">Performance Summary</h4>
                    <div className="p-4 rounded-md bg-gray-50 border">
                        {summary.map((point, i) => (
                            <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2">
                                &bull; {point}
                            </p>
                        ))}
                    </div>
                </div>

                {/* -------------------------------------- */}
                {/* --- 3. Recommendation [05:36:15] --- */}
                {/* -------------------------------------- */}
                <div className={`mt-6 p-4 rounded-lg flex justify-between items-start ${recBgColor}`}>
                    <div>
                        <h4 className={`text-lg font-bold ${recTextColor}`}>
                            {isRecommended ? '✅ Recommended for Hiring' : '❌ Not Recommended for Hiring'}
                        </h4>
                        <p className={`text-sm ${recTextColor} mt-1`}>
                            {recommendation.recommendation_message}
                        </p>
                    </div>
                    {/* Optional: Add a "Send Message" button here if required [05:39:19] */}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CandidateFeedbackDialog;