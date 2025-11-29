// src/components/LatestInterviewsList.jsx (Reconstructed)

"use client";

import React, { useState, useEffect } from 'react';
// NOTE: These imports are required but defined in other files in the project:
// import { useUser } from '@/context/userContext'; 
// import { superbase } from '@/services/superbaseClient';
// import InterviewCard from './InterviewCard'; 
// import { Button } from '@/components/ui/button';
// import { Video } from 'lucide-react'; // Or similar icon library

const LatestInterviewsList = () => {
    // const { user } = useUser(); // Assumed hook to get logged-in user [04:26:27]
    const [interviewList, setInterviewList] = useState([]); // [01:17:43]

    const getInterviewList = async () => {
        // if (!user?.email) return; // Guard clause for user data

        try {
            // Fetching data from 'interviews' table, ordered descending, and limited to 6
            // [04:25:59] to [04:39:39]
            const { data: interviews, error } = await superbase
                .from('interviews')
                .select('*')
                .eq('user_email', user.email)
                .order('id', { ascending: false }) // Latest first
                .limit(6); // Limit to 6 for the dashboard

            if (error) {
                console.error("Error fetching interviews: ", error);
            } else {
                setInterviewList(interviews); // [04:27:18]
            }
        } catch (e) {
            console.error("An unexpected error occurred:", e);
        }
    };

    useEffect(() => {
        // Call the fetch function when the component mounts and user is ready
        // if (user) { 
        getInterviewList(); // [04:26:54]
        // }
    }, [/* user */]);

    return (
        <div>
            {/* Title for the section [01:18:05] */}
            <h2 className="font-bold text-2xl mb-2 mt-5">
                Previously Created Interviews
            </h2>

            {/* Conditional Rendering: Empty State or List [01:18:58] */}
            {interviewList.length === 0 ? (
                <div className="flex flex-col items-center p-5 mt-5">
                    {/* Placeholder for Video Icon from lucide-react [01:20:09] */}
                    <div className="w-10 h-10 text-primary">Video Icon</div>
                    <h2 className="mt-3 text-lg">You don't have any interviews created</h2>
                    <Button className="mt-4">Create New Interview</Button>
                </div>
            ) : (
                /* List Display: Grid for Interview Cards [04:31:21] */
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
                    {interviewList.map((interview, index) => (
                        <InterviewCard
                            key={index}
                            interview={interview}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LatestInterviewsList;