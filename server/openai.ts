import { GoogleGenAI } from "@google/genai";
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

export async function generateChatResponse(
  userName: string = "pulkit",
  message: string
): Promise<string> {
  try {
    const systemPrompt = `You are an AI assistant for a campus app called CampusAI. Your name is CampusAI Assistant.
You are chatting with a student named ${userName}. Be friendly, helpful, and concise in your responses.
You can help with questions about courses, campus resources, events, study tips, and general academic advice.
If asked about specific campus information that you don't know, suggest where they might find that information.
Keep responses under 150 words when possible.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return (
      response.candidates[0].content?.parts[0]?.text ||
      "hey there! I am CampusAI Assistant. How can I help you?"
    );
  } catch (error) {
    console.error("Error generating response:", error);
    return "I'm having trouble connecting to my AI services right now. Please try again in a moment.";
  }
}