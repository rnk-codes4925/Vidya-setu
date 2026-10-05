import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { searchCSEKnowledge, CSE_CURRICULUM_DATA } from "./src/data/cseKnowledgeBase";

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Parse JSON request payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Server-side initialization of Google Gemini API via @google/genai
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check endpoint
app.get("/api/ai-tutor/health", (_req, res) => {
  res.json({
    status: "online",
    model: "gemini-3.8-flash",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// CSVTU CSE Syllabus direct query endpoint
app.get("/api/cse/syllabus/:semester", (req, res) => {
  const sem = Number(req.params.semester);
  if (!sem || sem < 1 || sem > 8) {
    return res.status(400).json({ error: "Invalid semester. CSVTU CSE scope is Semester 1 to 8 only." });
  }
  const subjects = CSE_CURRICULUM_DATA.filter((s) => s.semester === sem);
  res.json({
    semester: sem,
    scope: "CSVTU B.Tech CSE (Computer Science & Engineering)",
    subjects,
  });
});

// Main AI Tutor Chat endpoint powered by Google Gemini API
app.post("/api/ai-tutor/chat", async (req, res) => {
  try {
    const { message, history = [], mode = "doubts" } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, error: "Please provide a valid question or message." });
    }

    const cleanMsg = message.trim();

    // 1. Detect language (Hindi, Hinglish, or English)
    const hindiRegex = /[\u0900-\u097F]/;
    const isHindiScript = hindiRegex.test(cleanMsg);
    const hinglishWords = ["kya", "kaise", "kyun", "batao", "samjhao", "hai", "hota", "hoti", "hote", "karna", "chahiye", "ye", "wo", "isme", "usme", "bhi", "aur", "pe", "mein", "kar", "sakte", "nahi", "mujhe", "tum", "aap", "dost", "bhai"];
    const isHinglish = !isHindiScript && hinglishWords.some((w) => new RegExp(`\\b${w}\\b`, "i").test(cleanMsg));
    const detectedLang = isHindiScript ? "Hindi" : isHinglish ? "Hinglish" : "English";

    // 2. CSVTU CSE Academic RAG retrieval
    const ragResult = searchCSEKnowledge(cleanMsg);
    const isCSVTUAcademic = ragResult.isCSEAcademic;

    // 3. Construct System Instruction based on mode & academic grounding
    let systemInstruction = `You are "Vidya AI Tutor", an expert academic mentor and software engineering faculty at Vidya Setu.
You are powered by Google Gemini and trained to assist students with both:
1. CSVTU B.Tech Computer Science & Engineering (CSE) Semester 1 to 8 academic syllabus, concepts, and Previous Year Questions (PYQs).
2. General Programming, Data Structures & Algorithms, Full-Stack Web Development, System Design, Coding Doubts, and Tech Interview preparation.

### CORE OPERATING RULES:
- **Language Matching:**
  - If the student writes in English, reply in clear, professional English.
  - If the student writes in Devanagari Hindi, reply in fluent, respectful Hindi.
  - If the student writes in Hinglish (Roman Hindi/English blend like "Paging kya hoti hai OS me?"), reply in natural, engaging Hinglish so the student feels comfortable understanding complex concepts.
- **Tone:** Encouraging, pedagogically structured, crystal clear, concise yet deep.
- **Formatting:** Use structured Markdown with clear headings (###), bold key terms, numbered steps, bullet points, and clean, commented code blocks with language tags (e.g. \`\`\`cpp, \`\`\`python, \`\`\`javascript).
`;

    if (isCSVTUAcademic && ragResult.relevantContext) {
      systemInstruction += `\n### ACADEMIC CSE MODE ACTIVE (CSVTU SCHEME):
The student's question relates to B.Tech Computer Science & Engineering (CSVTU Scheme, Semesters 1-8).
Below is verified knowledge from the official curriculum:
${ragResult.relevantContext}

### STRICT ACCURACY DIRECTIVE FOR ACADEMIC CONTENT:
- Ground your explanation strictly in authentic computer science principles as per the CSVTU CSE curriculum.
- **NEVER FABRICATE** CSVTU syllabus topics, course codes, exam marks, or PYQs.
- If the student asks for a specific CSVTU topic or PYQ outside the verified knowledge base or beyond CSE Semesters 1–8 (e.g. Mechanical, Civil, or unverified subjects), politely explain: "Currently, verified academic syllabus is available for CSVTU Computer Science & Engineering (Semesters 1 to 8). This topic is outside our verified CSE records, but here is the computer science concept explained: [...]"
- Include a citation reference note at the end if applicable.
`;
    } else {
      systemInstruction += `\n### GENERAL AI MODE ACTIVE:
The student is asking a general coding doubt, software engineering question, algorithm concept, or career question.
Answer naturally, comprehensively, and practically using the best software engineering standards.
Explain concepts clearly, provide tested code snippets with time & space complexity, and provide edge-case analysis.
`;
    }

    if (mode === "code") {
      systemInstruction += `\nFOCUS ON CODE DEBUGGING: Highlight syntax errors, logic flaws, time complexity bottlenecks, and provide corrected, optimized code.`;
    } else if (mode === "eli5") {
      systemInstruction += `\nFOCUS ON SIMPLIFICATION: Explain like the student is a beginner (ELI5) using real-world intuitive analogies before showing technical details.`;
    } else if (mode === "interview") {
      systemInstruction += `\nFOCUS ON INTERVIEW PREPARATION: Frame the answer like a senior FAANG/Tech lead interviewer. Include standard follow-up questions, time/space trade-offs, and common pitfalls.`;
    }

    // 4. Build message contents including past conversation history for continuous context
    const contents: any[] = [];

    // Add prior conversation turns (up to last 10 messages for speed & rich context)
    const recentHistory = history.slice(-10);
    for (const item of recentHistory) {
      if (item && item.text) {
        contents.push({
          role: item.sender === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        });
      }
    }

    // Append the current student prompt
    contents.push({
      role: "user",
      parts: [{ text: cleanMsg }],
    });

    // 5. Check API Key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Google Gemini API Key is not configured on the server. Please ensure GEMINI_API_KEY is set.",
      });
    }

    // 6. Call Google Gemini via @google/genai with automatic fallback for high availability
    const candidateModels = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
    let response: any = null;
    let lastErr: any = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
          },
        });
        if (response && response.text) break;
      } catch (err: any) {
        lastErr = err;
        console.warn(`[Gemini Model Fallback] ${model} unavailable: ${err?.message || err}`);
      }
    }

    if (!response || !response.text) {
      throw lastErr || new Error("Unable to obtain response from Gemini models.");
    }

    const reply = response.text || "I processed your request, but could not generate text. Please try again.";
    const sourceCitation = ragResult.sourceCitations.length > 0 ? ragResult.sourceCitations.join(", ") : undefined;

    return res.json({
      success: true,
      reply,
      source: sourceCitation,
      mode: isCSVTUAcademic ? "cs_academic" : "general_ai",
      detectedLanguage: detectedLang,
      semester: ragResult.semesterMatched,
      subject: ragResult.subjectMatched,
    });
  } catch (error: any) {
    console.error("Gemini AI Tutor Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate AI Tutor response from Google Gemini.",
    });
  }
});

// Fallback/Legacy endpoints for platform compatibility
app.post("/api/support/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, error: "Question is required." });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: question,
      config: {
        systemInstruction: "You are the friendly support assistant for Vidya Setu, an educational and college coding platform. Guide students on platform features, coding tracks, whiteboard, and learning resources.",
      },
    });

    res.json({ success: true, answer: response.text || "I am here to help you navigate Vidya Setu!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Configure Vite middleware or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve("dist")));
    app.use(express.static(path.resolve("public")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Vidya Setu Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
