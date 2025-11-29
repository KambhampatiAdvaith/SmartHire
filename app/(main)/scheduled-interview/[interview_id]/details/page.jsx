"use client";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Loader2Icon, Mic, Phone, Timer } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import AlertConfirmation from "./_components/AlertConfirmation";
import { toast } from "sonner";
import TimerComponent from "./_components/TimerComponent";
import axios from "axios";
import { supabase } from "@/services/supabaseClient";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

function StartInterview() {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const [activeUser, setActiveUser] = useState(false);
  const [conversation, setConversation] = useState();
  const vapi = useRef(null); // Initialize useRef with null
  const [hasInterviewStarted, setHasInterviewStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTimer, setStartTimer] = useState(false);
  const [resetTimer, setResetTimer] = useState(false);
  const { interview_id } = useParams();
  const router = useRouter();

  // --- Rehydrate interviewInfo from localStorage if missing ---
  useEffect(() => {
    if (!interviewInfo) {
      const stored = localStorage.getItem('interviewInfo');
      if (stored) setInterviewInfo(JSON.parse(stored));
    }
  }, []);

  // --- Persist interviewInfo to localStorage ---
  useEffect(() => {
    if (interviewInfo) {
      localStorage.setItem('interviewInfo', JSON.stringify(interviewInfo));
    }
  }, [interviewInfo]);

  // --- Vapi event handlers ---
  const handleMessage = (message) => {
    if (message?.conversation) {
      setConversation(JSON.stringify(message.conversation));
    }
  };

  const handleCallStart = () => setActiveUser(true);
  const handleSpeechStart = () => {
    toast("Listening...");
    setStartTimer(false);
    setResetTimer(false);
  };
  const handleSpeechEnd = () => {
    toast("Thinking...");
    setStartTimer(true);
    setResetTimer(false);
  };
  const handleCallEnd = () => {
    setActiveUser(false);
    GenerateFeedback();
  };

  // --- Initialize Vapi ONCE ---
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      toast.error("VAPI Key is missing. Cannot start interview.");
      return;
    }
    const instanceVapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
    vapi.current = instanceVapi;

    // Attach listeners
    vapi.current.on("call-start", handleCallStart);
    vapi.current.on("speech-start", handleSpeechStart);
    vapi.current.on("speech-end", handleSpeechEnd);
    vapi.current.on("call-end", handleCallEnd);
    vapi.current.on("message", handleMessage);

    // Cleanup on unmount
    return () => {
      if (vapi.current) {
        vapi.current.off("call-start", handleCallStart);
        vapi.current.off("speech-start", handleSpeechStart);
        vapi.current.off("speech-end", handleSpeechEnd);
        vapi.current.off("call-end", handleCallEnd);
        vapi.current.off("message", handleMessage);
        vapi.current.stop();
        vapi.current = null;
      }
    };
  }, []); // <- Only runs once (mount/unmount)

  const GenerateFeedback = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/ai-feedback", {
        conversation,
      });

      const Content = result.data.feedback || result.data.content;
      if (!Content) {
        toast.error("Failed to get AI feedback.");
        setLoading(false);
        return;
      }

      let parsedFeedback;
      try {
        parsedFeedback = result.data.feedback
          ? result.data.feedback
          : JSON.parse(
            Content.replace(/^```json\s*/i, "")
              .replace(/\s*```$/, "")
              .trim()
          );
      } catch (e) {
        toast.error("Error parsing AI feedback structure.");
        setLoading(false);
        return;
      }

      // Save to database
      const { data, error } = await supabase
        .from("interview-feedback")
        .insert([
          {
            userName: interviewInfo?.userName,
            userEmail: interviewInfo?.userEmail,
            interview_id: interview_id,
            feedback: parsedFeedback,
            recommended: false,
          },
        ])
        .select();

      if (error) {
        toast.error("Database error: " + error.message);
        setLoading(false);
        return;
      }

      toast.success("Feedback saved and interview finished!");
      console.log("Redirecting to:", `/interview/${interview_id}/completed`);
      router.replace(`/interview/${interview_id}/completed`);
    } catch (error) {
      console.error("Error in GenerateFeedback:", error);
      toast.error("An error occurred during feedback generation.");
    } finally {
      setLoading(false);
    }
  };

  const startCall = () => {
    if (!vapi.current || !interviewInfo) {
      toast.error("Vapi not initialized or interview info missing.");
      return;
    }
    setLoading(true);
    let questionList = "";
    interviewInfo?.interviewData?.questionList.forEach(
      (item) => (questionList += item?.question + ", ")
    );
    questionList = questionList.trim().replace(/,$/, "");

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage:
        "Hi " +
        interviewInfo?.userName +
        "! Ready to kickstart your interview for the position of " +
        interviewInfo?.interviewData?.jobPosition +
        "? Let's begin!",
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer",
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `
You are an AI voice assistant conducting interviews for the position of "${interviewInfo?.interviewData?.jobPosition}".
🔹 Start with a warm, professional greeting. Example:
"Hi ${interviewInfo?.userName}! Ready to begin your ${interviewInfo?.interviewData?.jobPosition} interview? Let's get started!"

🔹 Interview Flow:
- Ask **one question at a time**.
- Questions: ${questionList}
- Wait for the candidate's response before moving forward.
- Keep questions **clear, concise, and engaging**.

🔹 Support During Interview:
- If the candidate struggles, offer hints without giving the answer.
  Example: "Need a hint? Think about how React tracks component updates!"
- Provide **brief, encouraging feedback** after each answer.
  Example: "That's a solid answer."
- If needed, ask:
  "Would you like me to rephrase or give a hint?"

🔹 Conversational Style:
- Keep it **casual yet professional**.
- Use phrases like:
  - "Alright, next up..."
  - "Let's tackle a tricky one!"

🔹 Wrapping Up:
- After 10-12 questions, **summarize** their performance.
  Example:
  "You did great! You handled some tough questions well. Keep sharpening your skills!"
- End with positive note:
  "Thanks for chatting! Hope to see you crushing projects soon! 🚀"

🔹 Key Guidelines:
✅ Be friendly, witty, and supportive.
✅ Keep responses short and natural.
✅ Adapt based on the candidate's confidence.
✅ Keep the focus on ${interviewInfo?.interviewData?.jobPosition}-based questions.
`.trim(),
          },
        ],
      },
    };

    try {
      vapi.current.start(assistantOptions);
      setHasInterviewStarted(true);
      toast.success("Connecting to AI Recruiter...");
    } catch (e) {
      toast.error("Failed to start the call.");
    } finally {
      setLoading(false);
    }
  };

  const stopInterview = () => {
    if (!hasInterviewStarted) {
      toast.error("Interview not started yet.");
      return;
    }
    if (vapi.current) {
      vapi.current.stop();
      setActiveUser(false);
      setStartTimer(false);
      setResetTimer(true);
      toast("Interview has been manually stopped. Generating feedback...");
    } else {
      toast.error("Vapi instance is not active.");
    }
  };

  return (
    <div className="p-20 lg:px-48 xl:px-56">
      <h2 className="font-bold text-xl flex justify-between">
        AI Interview Session
        <span className="flex gap-2 items-center">
          <Timer />
          <TimerComponent startTimer={startTimer} resetTimer={resetTimer} />
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <div className="bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center mt-4 shadow-2xl relative">
          {/* Pulsing effect when AI is not actively talking/listening (maybe just connected) */}
          {!activeUser && (
            <span className="absolute inset-30 rounded-full bg-blue-100 opacity-80 animate-pulse"></span>
          )}
          <Image
            src={"/ai-model.jpg"}
            alt="AI-Image"
            width={80}
            height={80}
            className={
              "w-[100px] h-[100px]  md:w-[80px] md:h-[80px] xl:w-[120px] xl:h-[120px] object-cover rounded-full "
            }
          />
          <h2 className=" font-semibold">AI Recruiter</h2>
        </div>
        <div className="bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center mt-4 shadow-2xl">
          <div className="relative">
            {/* Pulsing effect when User is active/speaking (based on your activeUser logic) */}
            {activeUser && (
              <span className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-pulse"></span>
            )}
            <h2 className="text-2xl bg-primary text-white p-3 rounded-full px-5 ">
              {interviewInfo?.userName ? interviewInfo.userName[0] : "U"}
            </h2>
          </div>

          <h2>{interviewInfo?.userName || "User"}</h2>
        </div>
      </div>
      <div className="flex items-center gap-5 justify-center mt-5">
        {/* Start/Stop Button Logic */}
        {!hasInterviewStarted ? (
          <button onClick={startCall} disabled={loading} className="p-3 bg-green-500 text-white rounded-full hover:bg-green-700 disabled:bg-gray-400 shadow-2xl transition-all">
            {loading ? (
              <Loader2Icon className="h-6 w-6 animate-spin" />
            ) : (
              <Phone className="h-6 w-6" />
            )}
          </button>
        ) : (
          <>
            <Mic className="h-12 w-12 p-3 bg-gray-500 text-white rounded-full cursor-pointer hover:bg-gray-800 hover:scale-110 transition-full ease-in-out shadow-2xl" />
            <AlertConfirmation stopInterview={stopInterview}>
              {loading ? (
                <Loader2Icon className="h-12 w-12 p-3 bg-red-500 text-white rounded-full animate-spin" />
              ) : (
                <Phone
                  className="h-12 w-12 p-3 bg-red-500 rounded-full text-white cursor-pointer hover:bg-red-900 hover:scale-110 transition-full ease-in-out shadow-2xl"
                />
              )}
            </AlertConfirmation>
          </>
        )}
      </div>
      <h2 className="text-sm text-gray-400 text-center mt-5">
        {hasInterviewStarted ? "Interview in Progress..." : "Click Phone to Start"}
      </h2>
    </div>
  );
}

export default StartInterview;