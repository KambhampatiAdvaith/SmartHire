// InterviewDetailContainer.jsx (Finalized as per Video Tutorial)

import React from 'react';
// Imports required for date formatting, which was installed in the video
import moment from 'moment';
// NOTE: Assuming you have this set up for UI components
// import { Clock, Calendar } from 'lucide-react'; 

/**
 * Displays the main job details, duration, and question list for a scheduled interview.
 */
function InterviewDetailContainer({ interviewDetail }) {
    // ⚠️ Safety check for loading/empty state
    if (!interviewDetail) {
        return <p className="text-center p-10 text-gray-600">Loading interview details or data not found...</p>;
    }

    // Safely parse the 'type' field from the database (stored as a JSON string)
    // [05:08:16]
    const interviewTypes = interviewDetail.type ? JSON.parse(interviewDetail.type) : [];

    // Safely access question list
    const questionList = interviewDetail.question_list || [];

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm mt-5">
            <h2 className="text-xl font-bold">
                {interviewDetail.job_position}
            </h2>

            {/* ------------------------------------------------------------- */}
            {/* --- Detail Metrics (Duration, Created On, Type) [05:04:00] --- */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-col gap-2 my-4
                          md:flex-row md:justify-between md:items-center 
                          border-b pb-4">

                {/* Duration */}
                <div className="flex items-center gap-2">
                    <div className="text-gray-500 w-4 h-4">
                        {/* <Clock className="w-4 h-4" /> */} ⏱️
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold">DURATION</p>
                        <p className="text-sm">{interviewDetail.duration}</p>
                    </div>
                </div>

                {/* Created On Date [05:07:02] */}
                <div className="flex items-center gap-2">
                    <div className="text-gray-500 w-4 h-4">
                        {/* <Calendar className="w-4 h-4" /> */} 🗓️
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold">CREATED ON</p>
                        <p className="text-sm">
                            {moment(interviewDetail.created_at).format('MMM DD, YYYY')}
                        </p>
                    </div>
                </div>

                {/* Interview Type [05:07:54] */}
                <div className="flex items-center gap-2">
                    <div className="text-gray-500 w-4 h-4">
                        {/* <Tags className="w-4 h-4" /> */} #️⃣
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold">TYPE</p>
                        {/* Displays types separated by comma (e.g., Technical, Behavioral) */}
                        <p className="text-sm">
                            {interviewTypes.join(', ') || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* --- Job Description [05:09:03] --- */}
            {/* ------------------------------------------------------------- */}
            <div className="mt-6">
                <h3 className="text-base font-bold mb-2">Job Description</h3>
                <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                    {interviewDetail.job_description}
                </p>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* --- Interview Questions [05:10:44] --- */}
            {/* ------------------------------------------------------------- */}
            <div className="mt-8 border-t pt-4">
                <h3 className="text-base font-bold mb-4">AI-Generated Interview Questions</h3>

                {questionList.length > 0 ? (
                    <div className="grid grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-10 text-sm">
                        {questionList.map((item, index) => (
                            <div key={index} className="flex gap-2">
                                {/* Index + 1 for the numbered list [05:11:40] */}
                                <span className="font-semibold text-primary">{index + 1}.</span>
                                <p className="text-gray-800">{item.question}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">
                        No questions were saved for this interview, or data is malformed.
                    </p>
                )}
            </div>
        </div>
    );
}

export default InterviewDetailContainer;