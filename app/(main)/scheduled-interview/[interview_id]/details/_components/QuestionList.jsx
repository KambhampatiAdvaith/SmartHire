// app/dashboard/create-interview/question-list.jsx
'use client';

import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import QuestionListContainer from './components/question-list-container';
import { useUser } from '@/context/user-detail-context';
import { createClient } from '@/services/superbase-client';

// Initialize Superbase client
const superbase = createClient();

const QuestionList = ({ formData, onGoToNextStep, onPassInterviewData }) => {
    const { user } = useUser();
    const [questionList, setQuestionList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    // --- Core Logic to Generate Questions (Wrapped in useCallback) ---
    const generateQuestionList = useCallback(async () => {
        setLoading(true);
        try {
            const result = await axios.post('/api/ai-model', {
                jobPosition: formData.jobPosition,
                jobDescription: formData.jobDescription,
                duration: formData.duration,
                type: formData.type,
            });

            // The AI returns a JSON string, which needs to be parsed after cleanup
            // This cleanup logic is CRITICAL for handling markdown fences (```json)
            const questionString = result.data.content.replace(/```json\s*|```/g, '').trim();
            const parsedQuestions = JSON.parse(questionString);

            // Ensure the result is an array before setting state
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
                setQuestionList(parsedQuestions);
            } else {
                toast.error("AI returned an invalid or empty list of questions.");
            }

        } catch (error) {
            console.error("Error generating questions:", error);
            // Log the key error in the console for troubleshooting
            toast.error("Error generating questions. Check API key or Prompt format.");
        } finally {
            setLoading(false);
        }
    }, [formData]); // Dependency on formData

    // --- Logic to Save Interview & Update Credits ---
    const onFinish = async () => {
        setSaveLoading(true);
        // Ensure you have installed 'uuid' if using a custom library, otherwise use crypto
        // Assuming you have installed 'uuid' and imported as: import { v4 as uuidv4 } from 'uuid';
        const interviewId = crypto.randomUUID();

        try {
            // 1. Save Interview Details
            const { error: interviewError } = await superbase
                .from('interviews')
                .insert({
                    ...formData,
                    question_list: questionList,
                    user_email: user.email,
                    interview_id: interviewId,
                })
                .select();

            // 2. Update User Credits (Decrement by 1)
            const { error: creditError } = await superbase
                .from('users')
                .update({ credits: user.credits - 1 })
                .eq('email', user.email);

            if (interviewError || creditError) {
                // Log and throw both errors for better server-side visibility
                console.error("Supabase Error saving interview or updating credits:", interviewError, creditError);
                throw new Error("Failed to save data or update credits.");
            }

            // 3. Pass data to the parent component and move to step 3
            onPassInterviewData(interviewId, questionList);
            onGoToNextStep();
            toast.success("Interview created and credit used successfully!");

        } catch (error) {
            console.error("Finish Error:", error);
            toast.error("Failed to finish interview setup. Check DB connection/permissions.");
        } finally {
            setSaveLoading(false);
        }
    };

    // --- EFFECT: Trigger question generation on component load ---
    useEffect(() => {
        // Only run if formData is ready, we have no questions, and are not already loading.
        if (formData && questionList.length === 0 && !loading) {
            generateQuestionList();
        }
    }, [formData, loading, questionList.length, generateQuestionList]); // Added dependencies

    // --- Component Rendering ---
    return (
        <div className="mt-5">
            {loading && (
                <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <div>
                        <p className="font-semibold text-primary">Generating Interview Questions...</p>
                        <p className="text-sm text-gray-600">Our AI is crafting personalized questions based on your job details.</p>
                    </div>
                </div>
            )}

            {!loading && questionList.length > 0 && (
                <>
                    <h2 className="text-xl font-bold mb-4">Generated Interview Questions</h2>
                    <QuestionListContainer questionList={questionList} />

                    <div className="flex justify-end mt-8">
                        <Button
                            onClick={onFinish}
                            disabled={saveLoading}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold"
                        >
                            {saveLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <ArrowRight className="w-5 h-5 mr-2" />
                            )}
                            Create Interview Link & Finish
                        </Button>
                    </div>
                </>
            )}

            {!loading && questionList.length === 0 && (
                <div className="p-5 border border-red-300 bg-red-50 rounded-xl text-center">
                    <p className="font-semibold text-red-700">No interview questions found in the server response.</p>
                    <p className="text-sm text-red-600 mt-2">Please check the server console for the raw AI response or API key error.</p>
                </div>
            )}
        </div>
    );
};

export default QuestionList;