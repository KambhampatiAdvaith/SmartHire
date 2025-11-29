"use client";
import React, { useState, useEffect } from "react";
import InterviewHeader from "./_components/InterviewHeader";
import { InterviewDataContext } from "@/context/InterviewDataContext";

function InterviewLayout({ children }) {
  const [interviewInfo, setInterviewInfo] = useState();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('interviewInfo');
    if (stored) setInterviewInfo(JSON.parse(stored));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (interviewInfo) {
      localStorage.setItem('interviewInfo', JSON.stringify(interviewInfo));
    }
  }, [interviewInfo]);

  return (
    <InterviewDataContext.Provider value={{ interviewInfo, setInterviewInfo }}>
      <div className="bg-secondary overflow-x-hidden">
        <InterviewHeader />
        {children}
      </div>
    </InterviewDataContext.Provider>
  );
}

export default InterviewLayout;