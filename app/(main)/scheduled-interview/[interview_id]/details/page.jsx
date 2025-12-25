"use client";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Loader2Icon, Mic, Phone, Timer } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";
import axios from "axios";
import { supabase } from "@/services/supabaseClient";
import { useParams, useRouter } from "next/navigation";

function StartInterview() {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const [activeUser, setActiveUser] = useState(false);
  const [conversation, setConversation] = useState();
  const vapi = useRef(null);
  const [hasInterviewStarted, setHasInterviewStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { interview_id } = useParams();
  const router = useRouter();

  // Rehydrate interviewInfo
  useEffect(() => {
    if (!interviewInfo) {
      const stored = localStorage.getItem("interviewInfo");
      if (stored) setInterviewInfo(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (interviewInfo) {
      localStorage.setItem("interviewInfo", JSON.stringify(interviewInfo));
    }
  }, [interviewInfo]);

  const handleMessage = (message) => {
    if (message?.conversation) {
      setConversation(JSON.stringify(message.conversation));
    }
  };

  const handleCallStart = () => setActiveUser(true);
  const handleSpeechStart = () => toast("Listening...");
  const handleSpeechEnd = () => toast("Thinking...");
  const handleCallEnd = () => {
    setActiveUser(false);
    GenerateFeedback();
  };

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      toast.error("VAPI key missing");
      return;
    }

    vapi.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
    vapi.current.on("call-start", handleCallStart);
    vapi.current.on("speech-start", handleSpeechStart);
    vapi.current.on("speech-end", handleSpeechEnd);
    vapi.current.on("call-end", handleCallEnd);
    vapi.current.on("message", handleMessage);

    return () => {
      vapi.current?.stop();
    };
  }, []);

  const GenerateFeedback = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/ai-feedback", { conversation });
      const feedback = result.data.feedback;

      await supabase.from("interview-feedback").insert([
        {
          userName: interviewInfo?.userName,
          userEmail: interviewInfo?.userEmail,
          interview_id,
          feedback,
          recommended: false,
        },
      ]);

      toast.success("Interview completed");
      router.replace(`/interview/${interview_id}/completed`);
    } catch {
      toast.error("Feedback generation failed");
    } finally {
      setLoading(false);
    }
  };

  const startCall = () => {
    if (!vapi.current || !interviewInfo) return;
    setLoading(true);

    try {
      vapi.current.start({ name: "AI Recruiter" });
      setHasInterviewStarted(true);
    } catch {
      toast.error("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const stopInterview = () => {
    vapi.current?.stop();
    toast("Interview stopped");
  };

  return (
    <div className="p-20 lg:px-48 xl:px-56">
      <h2 className="font-bold text-xl flex justify-between">
        AI Interview Session <Timer />
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <div className="bg-white h-[400px] rounded-lg border flex flex-col items-center justify-center shadow-2xl">
          <Image src="/ai-model.jpg" alt="AI" width={100} height={100} />
          <h2>AI Recruiter</h2>
        </div>

        <div className="bg-white h-[400px] rounded-lg border flex flex-col items-center justify-center shadow-2xl">
          <h2 className="text-2xl bg-primary text-white p-3 rounded-full">
            {interviewInfo?.userName?.[0] || "U"}
          </h2>
          <h2>{interviewInfo?.userName || "User"}</h2>
        </div>
      </div>

      <div className="flex justify-center mt-5">
        {!hasInterviewStarted ? (
          <button onClick={startCall} className="p-3 bg-green-500 text-white rounded-full">
            {loading ? <Loader2Icon className="animate-spin" /> : <Phone />}
          </button>
        ) : (
          <button onClick={stopInterview} className="p-3 bg-red-500 text-white rounded-full">
            <Phone />
          </button>
        )}
      </div>
    </div>
  );
}

export default StartInterview;
