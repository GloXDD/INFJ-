import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestion } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSuggestions = async (projectName: string, cityName?: string): Promise<AISuggestion> => {
  const ai = getAIClient();

  let locationContext = "";
  if (cityName && cityName.trim() !== "") {
    locationContext = `用户当前居住在: ${cityName}。请结合该城市的特色（例如地标、生活方式、气候），推荐一些本地化的、适合的活动。`;
  }

  const prompt = `
    我是一个 INFJ 人格类型，正在进行一个名为 "${projectName}" 的项目。
    请帮我将其拆解为 3 到 5 个可管理的里程碑，以保持我的能量水平。
    对于每个里程碑，建议一个具体的“微激励”或“微型节日”奖励。
    
    ${locationContext}

    奖励必须严格满足以下条件：
    1. **尽量无成本或非常低成本**（例如：免费的自然景观、去附近的公园散步、在家可做的冥想/阅读、一杯热茶、逛便利店）。
    2. 非工作相关，且容易执行。
    3. 具有感官享受和恢复性（Si/Se 补充）。
    4. 情感上令人满足。

    请以 JSON 对象格式返回，包含一个 'milestones' 列表，每个元素包含 'title'（里程碑名称）和 'reward'（奖励内容）。
    请确保所有返回内容均为**简体中文**。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "可执行的里程碑名称" },
                  reward: { type: Type.STRING, description: "感官体验类、低成本的奖励" },
                },
                required: ["title", "reward"],
              },
            },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AISuggestion;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini brainstorming failed:", error);
    throw error;
  }
};

export const generateRewardIdeas = async (cityName: string): Promise<string[]> => {
  const ai = getAIClient();
  
  const prompt = `
    用户位于"${cityName}"。请列出 8 个**无成本或极低成本**的“微型奖励”灵感，用于自我关怀。
    
    要求：
    1. 结合"${cityName}"的本地特色（如适合散步的特定街道、公园、景观，或当地的生活方式）。
    2. 如果城市不明确，则提供通用的高质量低成本奖励。
    3. 每个灵感不超过 12 个字。
    4. 包含适量的 Emoji。
    5. 风格：治愈、放松、INFJ 友好（独处、感官享受）。
    
    例如：
    - 去外滩吹吹晚风 🌊
    - 在安福路买束花 💐
    - 煮一杯热红酒 🍷
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as string[];
    }
    return [];
  } catch (error) {
    console.error("Failed to generate reward ideas", error);
    return [
      "去附近的公园发呆 🌳",
      "整理手机相册回忆 📱",
      "给自己泡一杯热茶 🍵", 
      "读两页喜欢的书 📖"
    ];
  }
};