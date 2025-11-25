import { RequestHandler } from "express";

interface AIRequest {
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export const handleAIChat: RequestHandler = async (req, res) => {
  const {
    userMessage,
    conversationHistory,
    model,
    temperature,
    maxTokens,
    systemPrompt,
  } = req.body as AIRequest;

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("OPENROUTER_API_KEY not configured");
    return res.status(500).json({
      error: "Service d'IA non disponible. Veuillez contacter l'administrateur.",
    });
  }

  if (!userMessage) {
    return res.status(400).json({ error: "User message is required" });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "http://localhost:5173",
          "X-Title": "Chat AI",
        },
        body: JSON.stringify({
          model: model || "x-ai/grok-4.1-fast:free",
          messages: [
            {
              role: "system",
              content: systemPrompt || "Tu es un assistant utile et amical.",
            },
            ...conversationHistory,
            {
              role: "user",
              content: userMessage,
            },
          ],
          temperature: temperature || 0.7,
          max_tokens: maxTokens || 2048,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API error:", data);
      return res.status(response.status).json({
        error: data.error?.message || "OpenRouter API error",
      });
    }

    const content = data.choices?.[0]?.message?.content || "Pas de réponse";
    res.json({ content });
  } catch (error) {
    console.error("AI route error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
