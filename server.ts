import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const genAI = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI Insights Endpoint
  app.post("/api/insights", async (req, res) => {
    try {
      const { baby, weights } = req.body;
      
      const prompt = `
        You are a NICU clinical assistant. Analyze this baby's weight trends and provide a concise, 
        encouraging, and clinically accurate 2-sentence summary for the doctor.
        
        Baby: ${baby.name}
        Sex: ${baby.sex}
        Birth Weight: ${baby.birthWeight}g
        Gestational Age at Birth: ${baby.gaWeeks} weeks, ${baby.gaDays} days
        Current DOL: ${req.body.dol}
        Current PMA: ${req.body.pma}
        
        Recent Weight History (Last ${weights.length} entries):
        ${weights.map((w: any) => `- ${w.date}: ${w.weight}g`).join('\n')}
        
        Summary:
      `;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      res.json({ text: result.text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate AI insights." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
