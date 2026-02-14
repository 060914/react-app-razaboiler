
import { GoogleGenAI } from "@google/genai";
import { MetricData } from "../types";

export const getAIInsight = async (metrics: MetricData): Promise<string> => {
  // Always use a named parameter and direct process.env.API_KEY access
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Business Performance Metrics for Raza Boiler System:
    - Net Profit: ₹${metrics.netProfit.toLocaleString()}
    - Yield Rate: ${metrics.yieldPercentage}%
    - Revenue: ₹${metrics.totalSalesRevenue.toLocaleString()}
    - Total Cost: ₹${metrics.totalExpenses.toLocaleString()}
    - Weight Shrinkage: ${metrics.shrinkage} Kg

    As an expert distribution analyst, provide 2-3 extremely brief, actionable strategic sentences for the owner. 
    Focus on operational efficiency and profit maximizing. Use professional, punchy tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class supply chain and poultry distribution expert.",
        temperature: 0.7,
      },
    });

    // Extracting text output via .text property as per guidelines
    return response.text || "Insufficient data for AI analysis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI intelligence services currently experiencing high latency.";
  }
};
