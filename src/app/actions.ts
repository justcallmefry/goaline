'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 1. GENERATE FULL BOARD STRATEGY
export async function generateMarketingPlan(prompt: string) {
  if (!process.env.OPENAI_API_KEY) return [];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert Chief Marketing Officer. Generate 3-5 high-impact growth tactics based on the user's business description.
Return a valid JSON object with a "tactics" array. Each tactic must have:
- title (string)
- budget (number, in dollars)
- section (exactly one of: "awareness", "conversion", "retention")
- rationale (short sentence why this tactic)
- action (one concrete next step)
Optionally include per tactic:
- tools (array of 0-3 tool/vendor names, e.g. ["Meta Ads", "Canva"])
- experts (array of 0-2 agency/expert names, e.g. ["Disruptive Advertising"])
Example: { "tactics": [ { "title": "Instagram Ads", "budget": 500, "section": "awareness", "rationale": "...", "action": "...", "tools": ["Meta Business Suite"], "experts": [] } ] }`
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content || "{}");
    return result.tactics || result.items || [];
  } catch (e) {
    console.error("AI Error:", e);
    return [];
  }
}

// 2. GENERATE TACTIC CONTENT (The Auto-Writer)
export async function generateTacticContent(tacticTitle: string, budget: number, instructions: string = '') {
  if (!process.env.OPENAI_API_KEY) {
    return "Error: OpenAI API Key is missing. Please add it to your .env.local file.";
  }

  try {
    const prompt = `
      You are an expert copywriter and strategist.
      
      The Tactic: "${tacticTitle}"
      The Budget: $${budget}
      User Instructions: "${instructions}"

      Please write the content for this tactic card.
      1. If the user asked for ad copy, write the Headline, Body Text, and CTA.
      2. If the user asked for an image, describe the image vividly.
      3. If no specific instructions, outline the execution steps.
      
      Keep it professional, actionable, and formatted clearly.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are a helpful marketing assistant." },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content || "No content generated.";
  } catch (e) {
    console.error("AI Error:", e);
    return "I had trouble connecting to the AI. Please try again.";
  }
}