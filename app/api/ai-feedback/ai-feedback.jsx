import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
    try {
        const { conversation } = await req.json();
        if (!conversation) {
            console.error("No conversation in body:", conversation);
            return NextResponse.json({ error: "Missing conversation." }, { status: 400 });
        }
        const FINAL_PROMPT = FEEDBACK_PROMPT.replace(
            "{{conversation}}",
            typeof conversation === "string" ? conversation : JSON.stringify(conversation)
        );

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            model: "mistralai/mistral-7b-instruct:free",
            messages: [{ role: "user", content: FINAL_PROMPT }],
        });

        if (completion.choices && completion.choices.length > 0) {
            let message = completion.choices[0].message.content;
            let cleanMessage = message.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
            try {
                let parsed = JSON.parse(cleanMessage);
                return NextResponse.json({ feedback: parsed });
            } catch (e) {
                console.error("JSON parse error. Raw content:", message);
                return NextResponse.json({ error: "Invalid AI response format", content: message }, { status: 200 });
            }
        } else {
            console.error("No choices returned from model:", completion);
            return NextResponse.json({ error: "No response from OpenAI model." }, { status: 502 });
        }
    } catch (e) {
        console.error("Error in AI Feedback API:", e);
        return NextResponse.json({ error: e.message ?? e.toString() }, { status: 500 });
    }
}