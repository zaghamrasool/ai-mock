import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Generate feedback for interview
app.post("/api/feedback", async (req, res) => {
  try {
    const { transcript, jobTitle, customPrompt } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const defaultPrompt = `As an expert interview coach, analyze the following interview transcript for a ${jobTitle || 'general'} position. 
    Provide constructive feedback on:
    1. Communication style and clarity.
    2. Professionalism and tone.
    3. Technical/Subject matter accuracy (if applicable).
    4. Key strengths.
    5. Areas for improvement with specific tips.
    6. Overall score out of 100.
    
    Return the response in markdown format. End with a JSON block containing only {"score": number}.`;

    const prompt = customPrompt ? `${customPrompt}\n\nTranscript:\n${transcript}` : `${defaultPrompt}\n\nTranscript:\n${transcript}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    const text = response.text || "";

    // Extract score from JSON block if present
    let score = 0;
    const scoreMatch = text.match(/\{"score":\s*(\d+)\}/);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1], 10);
    }

    res.json({ feedback: text, score });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
