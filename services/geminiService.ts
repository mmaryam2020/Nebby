
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = "gemini-3-flash-preview";

export const processBrainDump = async (text: string): Promise<Task[]> => {
    const prompt = `You are Nebby, a helpful space co-pilot. A user has given you a 'brain dump' of their thoughts. Extract clear, actionable tasks from it. For each task, decide if it's a 'quietNebula' task (essential, low-energy, maintenance, cruising) or a 'supernova' task (aspirational, requires effort, new projects, high energy). Also, assign an 'energyLevel' from 1 (very low effort) to 5 (very high effort). Respond ONLY with a JSON array of objects. Each object should have three keys: 'text' (the task description), 'type' ('quietNebula' or 'supernova'), and 'energyLevel' (a number from 1 to 5). If there are no actionable tasks, return an empty array.

Here is the brain dump:
---
${text}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: {
                                type: Type.STRING,
                                description: "A single, actionable task extracted from the text."
                            },
                            type: {
                                type: Type.STRING,
                                description: "The category of the task, either 'quietNebula' or 'supernova'.",
                                enum: ['quietNebula', 'supernova']
                            },
                            energyLevel: {
                                type: Type.NUMBER,
                                description: "An integer from 1 to 5 representing the estimated energy cost of the task."
                            }
                        },
                        required: ["text", "type", "energyLevel"]
                    }
                }
            }
        });
        
        const jsonString = response.text.trim();
        const parsedTasks = JSON.parse(jsonString) as Omit<Task, 'id'>[];

        // Add a unique ID and createdAt timestamp to each task
        return parsedTasks.map(task => ({ 
            ...task, 
            id: Date.now() + Math.random(),
            createdAt: Date.now()
        }));

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to process brain dump with Gemini.");
    }
};
