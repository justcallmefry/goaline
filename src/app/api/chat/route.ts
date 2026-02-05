import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Ensure you have OPENAI_API_KEY in your .env.local file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // or "gpt-3.5-turbo" if you want it cheaper/faster
      messages: [
        { role: "system", content: "You are GoaLine, an expert business growth strategist. You help users create marketing plans, strategies, and campaigns. Keep your answers concise, professional, and actionable." },
        { role: "user", content: message }
      ],
    });

    const reply = completion.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ reply: "I'm having trouble thinking right now. Please check your API key." }, { status: 500 });
  }
}