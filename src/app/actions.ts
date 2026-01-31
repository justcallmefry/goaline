'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMarketingPlan(description: string) {
  if (!description) return [];

  console.log("Asking OpenAI for plan...");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast, cheap, and smart
      messages: [
        {
          role: "system",
          content: `You are a Growth Marketing expert. 
          Generate 5 specific, high-impact marketing tactics for the user's business.
          Return ONLY a raw JSON array. No markdown, no explanations.
          Format: [{"title": "Tactic Name", "budget": 1000}, ...]
          Keep titles under 6 words. Budgets should be realistic estimates based on the business type.`
        },
        {
          role: "user",
          content: description,
        },
      ],
    });

    const content = completion.choices[0].message.content;
    
    if (!content) return [];

    // Clean up if GPT adds markdown code blocks (it loves to do that)
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
    
  } catch (e) {
    console.error("Failed to generate plan:", e);
    return [];
  }
}
// ... keep generateMarketingPlan above ...

export async function generateTacticContent(tacticTitle: string, budget: number) {
  if (!tacticTitle) return "";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional Copywriter. 
          The user has a marketing tactic called "${tacticTitle}" with a budget of $${budget}.
          
          Write the actual content for this tactic.
          - If it's an Ad, write the Headline and Ad Copy.
          - If it's an Email, write the Subject Line and Body.
          - If it's a Blog, write the Outline and Intro.
          
          Keep it professional, engaging, and ready to use. Do not use Markdown formatting.`
        },
        { role: "user", content: "Write the content." },
      ],
    });

    return completion.choices[0].message.content || "";
  } catch (e) {
    console.error("Failed to generate content:", e);
    return "";
  }
}