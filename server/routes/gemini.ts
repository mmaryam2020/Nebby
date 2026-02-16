import { Router } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const router = Router();

const model = 'gemini-flash-lite-latest';

// Lazy initialization: read API key when first needed, not at module load time
let ai: GoogleGenAI | null = null;
let initializationAttempted = false;

function getGeminiClient(): GoogleGenAI | null {
    if (initializationAttempted) {
        return ai;
    }

    initializationAttempted = true;
    const apiKey = process.env.GEMINI_API_KEY;
    const isValidKey = apiKey && apiKey !== 'PLACEHOLDER_API_KEY' && apiKey !== 'your_google_gemini_key_here';

    if (!isValidKey) {
        console.warn('⚠️  GEMINI_API_KEY is not set or is a placeholder. Brain dump and voice features will not work.');
        console.warn('   Get your API key from: https://aistudio.google.com/apikey');
        console.warn('   Add it to .env.local file');
        return null;
    }

    ai = new GoogleGenAI({ apiKey: apiKey! });
    console.log('✅ Gemini API client initialized successfully');
    return ai;
}

router.post('/brain-dump', async (req, res) => {
    const client = getGeminiClient();
    if (!client) {
        res.status(503).json({ error: 'Gemini API key not configured. Please add a valid GEMINI_API_KEY to your .env.local file.' });
        return;
    }

    try {
        const { text } = req.body;
        if (!text?.trim()) {
            res.status(400).json({ error: 'Text is required' });
            return;
        }

        const prompt = `You are Nebby, a helpful space co-pilot. A user has given you a 'brain dump' of their thoughts. Extract clear, actionable tasks from it. For each task, decide if it's a 'quietNebula' task (essential, low-energy, maintenance, cruising) or a 'supernova' task (aspirational, requires effort, new projects, high energy). Also, assign an 'energyLevel' from 1 (very low effort) to 5 (very high effort). Respond ONLY with a JSON array of objects. Each object should have three keys: 'text' (the task description), 'type' ('quietNebula' or 'supernova'), and 'energyLevel' (a number from 1 to 5). If there are no actionable tasks, return an empty array.

Here is the brain dump:
---
${text}
---
`;

        const response = await client.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING, description: 'A single, actionable task extracted from the text.' },
                            type: { type: Type.STRING, description: "The category: 'quietNebula' or 'supernova'.", enum: ['quietNebula', 'supernova'] },
                            energyLevel: { type: Type.NUMBER, description: 'An integer from 1 to 5 representing effort.' }
                        },
                        required: ['text', 'type', 'energyLevel']
                    }
                }
            }
        });

        const parsed = JSON.parse(response.text?.trim() || '[]');
        const tasks = parsed.map((t: any) => ({
            ...t,
            id: Date.now() + Math.random(),
            createdAt: Date.now()
        }));
        res.json(tasks);
    } catch (error) {
        console.error('Gemini brain-dump error:', error);
        res.status(500).json({ error: 'Failed to process brain dump' });
    }
});

router.post('/transcribe', async (req, res) => {
    const client = getGeminiClient();
    if (!client) {
        res.status(503).json({ error: 'Gemini API key not configured. Please add a valid GEMINI_API_KEY to your .env.local file.' });
        return;
    }

    try {
        const { audioBase64, mimeType } = req.body;
        if (!audioBase64 || !mimeType) {
            res.status(400).json({ error: 'Missing audio data' });
            return;
        }

        const response = await client.models.generateContent({
            model,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { inlineData: { mimeType, data: audioBase64 } },
                        { text: 'Transcribe this audio exactly as spoken. Return ONLY the transcribed text, nothing else. If the audio is empty or inaudible, return an empty string.' }
                    ]
                }
            ]
        });
        res.json({ text: response.text?.trim() || '' });
    } catch (error) {
        console.error('Gemini transcribe error:', error);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
});

export default router;
